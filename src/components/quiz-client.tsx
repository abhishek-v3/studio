'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, BrainCircuit, Home, RotateCw, Lightbulb } from 'lucide-react';
import { assessStudentAbility, AssessStudentAbilityOutput } from '@/ai/flows/assess-student-ability';
import { useToast } from '@/hooks/use-toast';
import type { Question, PastAnswer } from '@/types';

type QuizClientProps = {
  year: string;
  questions: Question[];
};

export default function QuizClient({ year, questions }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AssessStudentAbilityOutput | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);

  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  const score = useMemo(() => {
    if (!quizFinished) return 0;
    return Object.values(feedback).filter(Boolean).length;
  }, [quizFinished, feedback]);

  const handleSelectOption = (value: string) => {
    if (answered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleSubmitAnswer = () => {
    const selectedOption = selectedAnswers[currentQuestion.id];
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    setFeedback((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setAnswered(true);

    if (!isCorrect) {
      setShowHint(true);
    } else {
      moveToNextQuestion();
    }
  };
  
  const moveToNextQuestion = () => {
    setShowHint(false);
    setAnswered(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    setIsSubmitting(true);

    const pastAnswers: PastAnswer[] = questions.map((q) => ({
      question: q.question,
      answer: selectedAnswers[q.id] || 'No answer',
      isCorrect: feedback[q.id] || false,
    }));

    try {
      const result = await assessStudentAbility({ pastAnswers });
      setAiResult(result);
    } catch (error) {
      console.error('AI assessment failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get AI assessment. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setFeedback({});
    setIsSubmitting(false);
    setAiResult(null);
    setShowHint(false);
    setAnswered(false);
  };

  if (quizFinished) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Quiz Completed!</CardTitle>
            <CardDescription>GATE {year} Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-lg text-muted-foreground">Your Score</p>
              <p className="text-5xl font-bold text-primary">
                {score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span>
              </p>
              <Progress value={(score / questions.length) * 100} className="w-full max-w-sm mt-2" />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-accent" />
                <CardTitle className="font-headline text-xl">AI-Powered Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitting ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : aiResult ? (
                  <div className="space-y-2">
                    <p><strong>Ability Estimate:</strong> {aiResult.abilityEstimate}</p>
                    <p><strong>Difficulty Recommendation:</strong> {aiResult.difficultyRecommendation}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Could not retrieve AI assessment.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center font-headline">Review Your Answers</h3>
              {questions.map((q, index) => (
                <Alert key={q.id} variant={feedback[q.id] ? 'default' : 'destructive'} className="bg-card">
                  <div className="flex items-start gap-4">
                    {feedback[q.id] ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" /> : <XCircle className="h-5 w-5 text-red-500 mt-1" />}
                    <div className="flex-1">
                      <AlertTitle className="font-bold">Question {index + 1}: {q.question}</AlertTitle>
                      <AlertDescription>
                        <p>Your answer: <span className={feedback[q.id] ? '' : 'line-through text-destructive'}>{selectedAnswers[q.id] || 'Not answered'}</span></p>
                        {!feedback[q.id] && <p>Correct answer: {q.answer}</p>}
                        <p className="text-sm text-muted-foreground mt-1"><strong>Explanation:</strong> {q.explanation}</p>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={resetQuiz} variant="outline">
              <RotateCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/" passHref>
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">GATE {year} Quiz</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
          <Progress value={progressValue} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold">{currentQuestion.question}</p>
          <RadioGroup
            value={selectedAnswers[currentQuestion.id]}
            onValueChange={handleSelectOption}
            className="space-y-2"
            disabled={answered}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {showHint && (
            <Alert variant="destructive">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Hint</AlertTitle>
              <AlertDescription>
                {currentQuestion.explanation}
                <p className="font-bold mt-2">Correct Answer: {currentQuestion.answer}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Link href="/" passHref>
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          {answered ? (
             <Button
                onClick={moveToNextQuestion}
                className="bg-primary hover:bg-primary/90"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
          ) : (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswers[currentQuestion.id]}
              className="bg-accent hover:bg-accent/90"
            >
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
