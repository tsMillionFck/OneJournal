import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const ONBOARDING_STEPS = [
  {
    title: "The Architecture of a Life",
    subtitle: "WELCOME TO ONE-JOURNAL",
    content:
      "Most journals capture what happened. One-Journal captures *why* it matters and *how* it's trending. It's not just a record; it's a mathematical lens for your existence.",
    curiosity: "What if you could see your growth as a function of time?",
    icon: "📓",
  },
  {
    title: "Temporal Navigation",
    subtitle: "THE CALENDAR SYSTEM",
    content:
      "The calendar is your map. Navigate through months and years to see the dots of your life. Every day is a container for thoughts, tasks, and energy.",
    curiosity:
      "A month isn't just 30 days; it's a sequence of outcomes. Ready to map yours?",
    icon: "📅",
  },
  {
    title: "Deep Presence",
    subtitle: "ZEN WRITING & THE HOUR VIEW",
    content:
      "Enter Zen Mode for distraction-free reflection. Use multiple journals per day, apply frameworks for better thinking, and track your hours with granular precision.",
    curiosity:
      "What happens when the world disappears and only your thoughts remain?",
    icon: "🧘",
  },
  {
    title: "The Physics of Habits",
    subtitle: "MATHEMATICAL INSIGHTS",
    content:
      "We track habits using y = mx + b. Set your velocity (m), your starting point (b), and your goal. Our graphs predict exactly when you'll reach your destination.",
    curiosity: "Can you beat the math? Or will the math guide you home?",
    icon: "📈",
  },
  {
    title: "Operational Awareness",
    subtitle: "THE SYSTEM LOG",
    content:
      "For the hyper-granular: The System Log (Ctrl+S) records moments with sentiment. It's the black-box recorder for your daily operations.",
    curiosity:
      "Every high and low is a data point. Are you ready to optimize the system?",
    icon: "⚡",
  },
];

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 0.2,
        ease: "back.out(1.2)",
      }
    );
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Transition out
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        onComplete: () => {
          setCurrentStep(currentStep + 1);
          // Transition in
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
          );
        },
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 0.6,
      ease: "power2.in",
      onComplete: onComplete,
    });
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <div
        ref={cardRef}
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px]"
      >
        {/* Visual Side */}
        <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-12 relative overflow-hidden">
          <div className="text-8xl md:text-9xl animate-pulse select-none opacity-20 absolute">
            {step.icon}
          </div>
          <div className="text-6xl md:text-7xl relative z-10 drop-shadow-lg">
            {step.icon}
          </div>

          {/* Step indicator */}
          <div className="absolute bottom-8 flex gap-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-black" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-2/3 p-10 md:p-14 flex flex-col justify-between bg-white">
          <div ref={contentRef}>
            <span className="font-['Inter'] text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4 block">
              {step.subtitle}
            </span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-black text-black mb-6 leading-tight">
              {step.title}
            </h2>
            <p className="font-['Lora'] text-lg text-gray-600 leading-relaxed mb-8">
              {step.content}
            </p>
            <div className="bg-gray-50 border-l-4 border-black p-5 italic text-sm text-gray-800 font-medium">
              "{step.curiosity}"
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={handleComplete}
              className="text-gray-400 font-['Inter'] text-xs uppercase tracking-widest font-bold hover:text-black transition-colors"
            >
              Skip Intro
            </button>
            <button
              onClick={handleNext}
              className="bg-black text-white px-10 py-4 rounded-full font-['Inter'] text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {currentStep === ONBOARDING_STEPS.length - 1
                ? "Get Started"
                : "Next Step →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
