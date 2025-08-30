import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import QuizClient from '@/components/quiz-client';
import type { Question, QuestionsData } from '@/types';

type QuizPageProps = {
  params: {
    year: string;
  };
};

async function getQuestionsForYear(year: string): Promise<Question[] | null> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'gate-cs-questions.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: QuestionsData = JSON.parse(fileContent);
    return data[year] || null;
  } catch (error) {
    console.error(`Failed to load questions for year ${year}:`, error);
    return null;
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { year } = params;
  const questions = await getQuestionsForYear(year);

  if (!questions) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <QuizClient year={year} questions={questions} />
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'gate-cs-questions.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: QuestionsData = JSON.parse(fileContent);
    const years = Object.keys(data);
    return years.map((year) => ({
      year: year,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}
