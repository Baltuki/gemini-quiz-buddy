import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestionType } from "./QuizQuestion";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface QuizResultsProps {
  questions: QuizQuestionType[];
  userAnswers: (string | null)[];
  onRestart: () => void;
}

export function QuizResults({ questions, userAnswers, onRestart }: QuizResultsProps) {
  const score = userAnswers.reduce((acc, answer, index) => {
    return acc + (answer === questions[index]?.answer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return "text-quiz-success";
    if (percentage >= 60) return "text-quiz-warning";
    return "text-quiz-error";
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return "Ya estas para el bootcamp 🎉";
    if (percentage >= 60) return "Safa 👍";
    return "A pedazos! 📚";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Score Summary */}
      <Card className="text-center shadow-quiz bg-gradient-secondary border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Quiz Completado!</CardTitle>
          <div className="space-y-2">
            <div className={`text-5xl font-bold ${getScoreColor()}`}>
              {score}/{questions.length}
            </div>
            <div className={`text-2xl font-semibold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-lg text-muted-foreground">
              {getScoreMessage()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onRestart}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-quiz transition-smooth hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Intentar Denuevo
          </Button>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center">Revisión de preguntas</h3>
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.answer;

          return (
            <Card key={index} className="shadow-card border-l-4 border-l-quiz-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Pregunta {index + 1} • {question.topic}
                    </div>
                    <h4 className="font-semibold text-base leading-relaxed">
                      {question.question}
                    </h4>
                  </div>
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-quiz-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-quiz-error flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {Object.entries(question.options).map(([option, text]) => {
                    const isCorrectAnswer = option === question.answer;
                    const isUserAnswer = option === userAnswer;
                    
                    let className = "p-3 rounded-lg border text-sm ";
                    
                    if (isCorrectAnswer) {
                      className += "bg-quiz-success/10 border-quiz-success text-quiz-success font-medium";
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      className += "bg-quiz-error/10 border-quiz-error text-quiz-error";
                    } else {
                      className += "bg-muted/50 border-border text-muted-foreground";
                    }

                    return (
                      <div key={option} className={className}>
                        <span className="font-bold mr-2">{option}.</span>
                        {text}
                        {isCorrectAnswer && (
                          <span className="ml-2 text-xs font-semibold">✓ Correcto</span>
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <span className="ml-2 text-xs font-semibold">Tu respuesta</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}