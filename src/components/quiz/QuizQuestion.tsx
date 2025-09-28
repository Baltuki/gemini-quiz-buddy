import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuizQuestionType {
  topic: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
}

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  showAnswer: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onAnswerSelect,
  showAnswer,
  questionNumber,
  totalQuestions
}: QuizQuestionProps) {
  const options = ['A', 'B', 'C', 'D'] as const;

  const getOptionStyle = (option: string) => {
    if (!showAnswer) {
      return selectedAnswer === option ? "quiz-selected" : "quiz-default";
    }

    if (option === question.answer) {
      return "quiz-correct";
    }
    
    if (selectedAnswer === option && option !== question.answer) {
      return "quiz-incorrect";
    }
    
    return "quiz-default";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-quiz bg-gradient-secondary border-0">
      <CardHeader className="text-center space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Pregunta {questionNumber} de {totalQuestions}
          {question.topic && question.topic !== "undefined" && ` • ${question.topic}`}
        </div>
        <h2 className="text-2xl font-bold text-foreground leading-relaxed">
          {question.question}
        </h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            size="lg"
            className={cn(
              "w-full h-auto p-4 text-left justify-start font-medium text-base transition-smooth hover:scale-[1.02]",
              getOptionStyle(option)
            )}
            onClick={() => !showAnswer && onAnswerSelect(option)}
            disabled={showAnswer}
          >
            <span className="font-bold mr-3 text-quiz-primary">
              {option}.
            </span>
              <span className="flex-1">{question.options[option]}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}