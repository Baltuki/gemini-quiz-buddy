import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion, QuizQuestionType } from "./QuizQuestion";
import { QuizProgress } from "./QuizProgress";
import { QuizResults } from "./QuizResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Code, Database } from "lucide-react";

const QUIZ_TOPICS = [
  "Basic data structures (arrays, lists, variables)",
  "Basic JavaScript (variables, loops, functions)", 
  "Basic logic (if statements, comparisons)"
];

export function ProgrammingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const { toast } = useToast();

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-question', {
        body: { difficulty: 'beginner', count: 30 }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No questions received from quiz generation');
      }
      return data.questions as QuizQuestionType[];
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error generating questions",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    setIsLoading(true);
    setQuizStarted(true);
    
    try {
      // Generate all questions at once
      const newQuestions = await generateQuestions();

      // Take only 30 questions for the quiz
      const selectedQuestions = newQuestions.slice(0, 30);
      
      setQuestions(selectedQuestions);
      setUserAnswers(new Array(30).fill(null));
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setQuizComplete(false);
      
      toast({
        title: "¡Quiz iniciado!",
        description: "Responde cada pregunta lo mejor que puedas.",
      });
    } catch (error) {
      setQuizStarted(false);
      console.error('Error starting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);
    setShowAnswer(true);
    
    const isCorrect = selectedAnswer === questions[currentQuestion].answer;
    
      toast({
        title: isCorrect ? "¡Correcto! 🎉" : "No es correcto 🤔",
        description: isCorrect
          ? "¡Bien hecho! ¡Sigue así!"
          : `La respuesta correcta es ${questions[currentQuestion].answer}: ${questions[currentQuestion].options[questions[currentQuestion].answer]}`,
        variant: isCorrect ? "default" : "destructive",
      });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const currentScore = userAnswers.slice(0, currentQuestion + (showAnswer ? 1 : 0)).reduce((acc, answer, index) => {
    return acc + (answer === questions[index]?.answer ? 1 : 0);
  }, 0);

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-quiz bg-card border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quiz de Programación - Nivel Principiante
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              ¡Pon a prueba tus conocimientos de conceptos básicos de programación! Este quiz cubre estructuras de datos fundamentales, conceptos básicos de JavaScript y lógica.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Database className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">Estructuras de datos y variables básicas</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Code className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">Fundamentos de JavaScript</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Brain className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">Lógica y toma de decisiones</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                5 preguntas • Generado por IA • Retroalimentación inmediata
              </p>
              <Button 
                onClick={startQuiz} 
                disabled={isLoading}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-quiz transition-smooth hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generando preguntas...
                  </>
                ) : (
                  "Comenzar Quiz"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-gradient-secondary p-4 py-8">
        <QuizResults 
          questions={questions}
          userAnswers={userAnswers}
          onRestart={restartQuiz}
        />
      </div>
    );
  }

  if (isLoading || !questions[currentQuestion]) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-quiz-primary" />
          <p className="text-lg font-medium">Cargando pregunta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 py-8 space-y-6">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Quiz de Programación - Nivel Principiante</h1>
        <QuizProgress 
          currentQuestion={currentQuestion + 1}
          totalQuestions={questions.length}
          score={currentScore}
        />
      </div>

      <QuizQuestion
        question={questions[currentQuestion]}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        showAnswer={showAnswer}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
      />

      <div className="flex justify-center space-x-4">
        {!showAnswer ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-quiz transition-smooth hover:scale-105"
          >
            Enviar respuesta
          </Button>
        ) : (
          <>
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-quiz transition-smooth hover:scale-105"
            >
              {currentQuestion < questions.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
            </Button>
            <Button
              onClick={() => setQuizComplete(true)}
              variant="outline"
              className="ml-2"
            >
              Terminar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}