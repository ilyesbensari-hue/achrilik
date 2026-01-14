import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-6xl mb-6">👻</div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Page Introuvable</h2>
                <p className="text-gray-600 mb-8">
                    Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
                </p>
                <Link
                    href="/"
                    className="btn btn-primary w-full block py-3"
                >
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}
