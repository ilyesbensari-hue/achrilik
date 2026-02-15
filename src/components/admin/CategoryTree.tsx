'use client';

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    parentId: string | null;
    _count: {
        products: number;
    };
    children?: Category[];
}

interface Props {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onReorder: (updates: { id: string; order: number }[]) => Promise<void>;
}

export default function CategoryTree({ categories, onEdit, onDelete, onReorder }: Props) {
    const [localCategories, setLocalCategories] = useState(categories);

    // Build tree structure
    const buildTree = (cats: Category[]): Category[] => {
        const rootCats = cats.filter(c => !c.parentId).sort((a, b) => a.order - b.order);
        return rootCats.map(root => ({
            ...root,
            children: cats.filter(c => c.parentId === root.id).sort((a, b) => a.order - b.order)
        }));
    };

    const tree = buildTree(localCategories);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Find dragged and target categories
        const allFlat = localCategories;
        const activeIndex = allFlat.findIndex(c => c.id === active.id);
        const overIndex = allFlat.findIndex(c => c.id === over.id);

        if (activeIndex === -1 || overIndex === -1) return;

        const activeCategory = allFlat[activeIndex];
        const overCategory = allFlat[overIndex];

        // Only reorder within same parent level
        if (activeCategory.parentId !== overCategory.parentId) {
            console.warn('Cannot reorder across different parent levels');
            return;
        }

        // Get siblings 
        const siblings = allFlat.filter(c => c.parentId === activeCategory.parentId);
        const siblingIds = siblings.map(s => s.id);
        const activeIdx = siblingIds.indexOf(active.id as string);
        const overIdx = siblingIds.indexOf(over.id as string);

        const newSiblings = arrayMove(siblings, activeIdx, overIdx);

        // Update order values
        const updates = newSiblings.map((cat, index) => ({
            id: cat.id,
            order: index
        }));

        // Optimistic update
        const updatedCategories = allFlat.map(cat => {
            const update = updates.find(u => u.id === cat.id);
            return update ? { ...cat, order: update.order } : cat;
        });

        setLocalCategories(updatedCategories);

        // Send to server
        try {
            await onReorder(updates);
        } catch (error) {
            console.error('Failed to reorder:', error);
            // Revert on error
            setLocalCategories(categories);
        }
    };

    return (
        <div className="space-y-2">
            {tree.map(category => (
                <CategoryNodeContainer
                    key={category.id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReorder={onReorder}
                    level={0}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                />
            ))}
        </div>
    );
}

function CategoryNodeContainer({
    category,
    onEdit,
    onDelete,
    onReorder,
    level,
    sensors,
    handleDragEnd
}: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
    onReorder: (updates: { id: string; order: number }[]) => Promise<void>;
    level: number;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const children = category.children || [];
    const hasChildren = children.length > 0;

    // Create sortable context for siblings at this level
    const siblingIds = hasChildren ? children.map(c => c.id) : [];

    return (
        <div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <CategoryNodeItem
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    level={level}
                    hasChildren={hasChildren}
                    expanded={expanded}
                    onToggle={() => setExpanded(!expanded)}
                />

                {/* Children */}
                {hasChildren && expanded && (
                    <div className="ml-6 mt-2 space-y-2">
                        <SortableContext
                            items={siblingIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {children.map(child => (
                                <SortableCategoryNode
                                    key={child.id}
                                    category={child}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onReorder={onReorder}
                                    level={level + 1}
                                    sensors={sensors}
                                    handleDragEnd={handleDragEnd}
                                />
                            ))}
                        </SortableContext>
                    </div>
                )}
            </DndContext>
        </div>
    );
}

function SortableCategoryNode(props: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
    onReorder: (updates: { id: string; order: number }[]) => Promise<void>;
    level: number;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [expanded, setExpanded] = useState(true);
    const children = props.category.children || [];
    const hasChildren = children.length > 0;

    return (
        <div ref={setNodeRef} style={style}>
            <CategoryNodeItem
                category={props.category}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                level={props.level}
                hasChildren={hasChildren}
                expanded={expanded}
                onToggle={() => setExpanded(!expanded)}
                dragHandleProps={{ ...attributes, ...listeners }}
            />

            {/* Nested children */}
            {hasChildren && expanded && (
                <div className="ml-6 mt-2 space-y-2">
                    {children.map(child => (
                        <SortableCategoryNode
                            key={child.id}
                            category={child}
                            onEdit={props.onEdit}
                            onDelete={props.onDelete}
                            onReorder={props.onReorder}
                            level={props.level + 1}
                            sensors={props.sensors}
                            handleDragEnd={props.handleDragEnd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CategoryNodeItem({
    category,
    onEdit,
    onDelete,
    level,
    hasChildren,
    expanded,
    onToggle,
    dragHandleProps
}: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
    level: number;
    hasChildren: boolean;
    expanded: boolean;
    onToggle: () => void;
    dragHandleProps?: any;
}) {
    return (
        <div
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg border border-gray-200 bg-white shadow-sm"
        >
            {/* Expand/Collapse */}
            {hasChildren ? (
                <button
                    onClick={onToggle}
                    className="text-gray-400 hover:text-gray-600 transition-transform"
                    style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            ) : (
                <div className="w-4" />
            )}

            {/* Drag Handle */}
            <div
                {...dragHandleProps}
                className="text-gray-300 cursor-move hover:text-gray-500 transition-colors"
                title="Glisser pour réorganiser"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
            </div>

            {/* Icon */}
            {category.icon && (
                <span className="text-xl">{category.icon}</span>
            )}

            {/* Name */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{category.slug}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{category._count.products} produits</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(category)}
                    className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md font-medium transition-colors"
                >
                    Modifier
                </button>
                <button
                    onClick={() => onDelete(category)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md font-medium transition-colors"
                >
                    Supprimer
                </button>
            </div>
        </div>
    );
}
