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
        {Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onAnswerSelect(key)}
            disabled={showAnswer}
            className={`
              w-full text-left p-4 rounded-lg border mb-2 transition
              ${selectedAnswer === key
                ? 'bg-gradient-primary text-white border-quiz-primary shadow-lg scale-105'
                : 'bg-card border-muted hover:bg-gradient-primary hover:text-white'}
              ${showAnswer && question.answer === key ? 'border-green-500' : ''}
            `}
            style={{
              cursor: showAnswer ? 'not-allowed' : 'pointer'
            }}
          >
            <span className="font-bold mr-2">{key}.</span> {value}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}