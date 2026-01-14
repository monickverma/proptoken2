import VerificationProgress from '@/components/verification/VerificationProgress';

export default async function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <VerificationProgress submissionId={id} />
        </main>
    );
}
