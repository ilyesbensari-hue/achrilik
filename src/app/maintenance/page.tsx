export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center max-w-md px-6">
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-5xl">🔧</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Maintenance en cours
                </h1>
                <p className="text-gray-600 mb-6">
                    Nous effectuons une maintenance pour améliorer votre expérience.
                    Nous serons de retour très bientôt !
                </p>
                <div className="flex flex-col gap-3 text-sm text-gray-500">
                    <p>En cas d&apos;urgence, contactez-nous :</p>
                    <a href="mailto:contact@achrilik.com" className="text-primary hover:underline">
                        contact@achrilik.com
                    </a>
                </div>
                <div className="mt-8 text-sm text-gray-400">
                    Achrilik Team 💚
                </div>
            </div>
        </div>
    );
}
