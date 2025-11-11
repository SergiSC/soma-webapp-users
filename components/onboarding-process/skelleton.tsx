"use client";

export interface OnboardingSkelletonProps {
  title: string;
  description: string;
  content: React.ReactNode;
}

export function OnboardingSkelleton({
  title,
  description,
  content,
}: OnboardingSkelletonProps) {
  return (
    <main className="flex flex-col items-center md:justify-center h-screen gap-4 px-4 pt-16 pb-8 ">
      <div className="flex flex-col gap-2 h-full mx-auto md:h-[300px] max-w-[600px]">
        <h2 className="text-4xl font-bold text-primary">{title}</h2>
        <p className="text-gray-600 pb-6">{description}</p>
        {content}
      </div>
    </main>
  );
}
