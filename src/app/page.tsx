import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpenCheck } from 'lucide-react';
import Header from '@/components/header';
import type { QuestionsData } from '@/types';

async function getAvailableYears() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'gate-cs-questions.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: QuestionsData = JSON.parse(fileContent);
    return Object.keys(data).sort((a, b) => Number(b) - Number(a));
  } catch (error) {
    console.error('Failed to load question data:', error);
    return [];
  }
}

export default async function Home() {
  const years = await getAvailableYears();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                  GATE CS Navigator
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Your ultimate companion for GATE Computer Science preparation.
                  Select a year to start your quiz.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full pb-12 md:pb-24 lg:pb-32">
          <div className="container px-4 md:px-6">
            {years.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {years.map((year) => (
                  <Link key={year} href={`/quiz/${year}`} passHref>
                    <Card className="h-full flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg dark:hover:shadow-accent/20">
                      <CardHeader>
                        <CardTitle className="font-headline text-2xl">GATE {year}</CardTitle>
                        <CardDescription>Practice questions from {year}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-between text-accent">
                          Start Quiz <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">Could not find any question sets. Please check the data source.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center w-full h-16 border-t">
        <p className="text-sm text-muted-foreground">&copy; 2024 GATE CS Navigator. All rights reserved.</p>
      </footer>
    </div>
  );
}
