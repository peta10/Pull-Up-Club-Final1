import React from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Can I submit a video recorded earlier this year?",
      answer: "Yes, as long as it follows all the rules: clear view, full range of motion, continuous unedited footage, and public accessibility."
    },
    {
      question: "Can I edit out the part before or after the reps to shorten the video?",
      answer: "No. The video must be one continuous, uncut recording from before your first rep until after your final rep. Any trimming, cutting, or editing will result in disqualification."
    },
    {
      question: "Is it okay to use filters or enhance lighting?",
      answer: "No. To maintain integrity, videos should be submitted as captured. No filters, lighting enhancements, or AI-driven adjustments of any kind."
    },
    {
      question: "What happens if I forget to show the full movement or my chin isn't clearly above the bar?",
      answer: "The rep may be disqualified or the entire submission may be denied. We strongly recommend reviewing your footage before submitting to make sure it meets all movement standards."
    },
    {
      question: "Can I speed up or slow down the video?",
      answer: "No. Videos must be submitted at normal speed without any acceleration, slow motion, or time effects."
    },
    {
      question: "What platforms can I use to submit my video?",
      answer: "You can upload your video to any public platform such as YouTube, Instagram, TikTok. Just make sure your privacy settings allow us to view it without logging in or requesting access."
    },
    {
      question: "My video is too dark / blurry / unstable — will it still count?",
      answer: "If we can't clearly verify each rep and form standard, the video may be denied. Use good lighting, a stable camera, and a clear angle to ensure your performance is visible."
    },
    {
      question: "Can I have music playing in the background?",
      answer: "Yes, as long as it doesn't interfere with visibility or audio review. Just avoid anything offensive or distracting, this is still a community event!"
    },
    {
      question: "How do you check for AI-generated or looped videos?",
      answer: "Our team reviews all footage for signs of manipulation, including AI involvement, visual looping, or suspiciously consistent repetitions. Any entry suspected of editing or falsifying reps will be denied automatically, and may be banned from future events."
    },
    {
      question: "Can I submit more than one video a month?",
      answer: "If you're subscribed to the monthly plan, you can submit ONE ENTRY a month!"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions (FAQ)</h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
            <h3 className="text-lg font-medium text-white mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-300">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;