"use client";

export default function DeliveryBanner() {
    return (
        <div className="bg-gradient-to-r from-[#D21034] to-[#a80d2a] text-white py-3 px-4">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚚</span>
                        <p className="font-bold text-sm md:text-base">
                            Commandez maintenant et recevez demain (jour ouvré) sur Oran
                        </p>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/30"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <p className="font-semibold text-sm md:text-base italic">
                            Commandi lyoum, tewaslek ghadwa!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
