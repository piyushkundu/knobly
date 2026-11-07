function unavailable(): never { throw new Error('Email is disabled in this isolated Preview.'); }
export async function sendVerificationEmail(..._args: unknown[]): Promise<void> { unavailable(); }
export async function sendPasswordResetMail(..._args: unknown[]): Promise<void> { unavailable(); }
export async function sendPasswordResetMailForKnoblyId(..._args: unknown[]): Promise<void> { unavailable(); }
