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

  const generateQuestion = async (topicIndex: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-question', {
        body: { topic: QUIZ_TOPICS[topicIndex % QUIZ_TOPICS.length] }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data received from quiz generation');
      }

      return data as QuizQuestionType;
    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: "Error generating question",
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
      // Generate 5 questions
      const newQuestions: QuizQuestionType[] = [];
      for (let i = 0; i < 5; i++) {
        const question = await generateQuestion(i);
        newQuestions.push(question);
      }
      
      setQuestions(newQuestions);
      setUserAnswers(new Array(5).fill(null));
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setQuizComplete(false);
      
      toast({
        title: "Quiz started!",
        description: "Answer each question to the best of your ability.",
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
      title: isCorrect ? "Correct! 🎉" : "Not quite right 🤔",
      description: isCorrect 
        ? "Well done! Keep it up!" 
        : `The correct answer is ${questions[currentQuestion].answer}: ${questions[currentQuestion].options[questions[currentQuestion].answer]}`,
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
              Programming Quiz - Beginner Level
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Test your knowledge of basic programming concepts! This quiz covers fundamental data structures, JavaScript basics, and logical thinking.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Database className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">Basic data structures & variables</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Code className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">JavaScript fundamentals</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Brain className="w-5 h-5 text-quiz-primary" />
                <span className="text-sm">Logic & decision making</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                5 questions • AI-generated • Immediate feedback
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
                    Generating Questions...
                  </>
                ) : (
                  "Start Quiz"
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
          <p className="text-lg font-medium">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 py-8 space-y-6">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Programming Quiz - Beginner Level</h1>
        
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
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-quiz transition-smooth hover:scale-105"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
          </Button>
        )}
      </div>
    </div>
  );
}