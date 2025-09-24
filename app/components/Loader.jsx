export default function Loader({ stage = "processing" }) {
  const stages = {
    processing: { text: "Processing your request...", icon: "⚡" },
    extracting: { text: "Extracting content from URL...", icon: "🔍" },
    summarizing: { text: "Generating AI summary...", icon: "🤖" }
  };

  const currentStage = stages[stage] || stages.processing;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">{currentStage.icon}</span>
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {currentStage.text}
            </h3>
            <p className="text-gray-600 text-sm">
              This usually takes a few seconds...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}