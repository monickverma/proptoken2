const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function createSubmission(data: any) {
    const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create submission');
    }

    return response.json();
}

export async function getSubmissionStatus(id: string) {
    const response = await fetch(`${API_URL}/submissions/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch status');
    }

    return response.json();
}
