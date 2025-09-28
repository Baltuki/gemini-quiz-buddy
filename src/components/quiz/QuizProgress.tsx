import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

export function QuizProgress({ currentQuestion, totalQuestions, score }: QuizProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span>Progress</span>
        <span>Score: {score}/{currentQuestion}</span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-secondary"
      />
    </div>
  );
}