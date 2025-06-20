import React from "react";
import Layout from "../../components/Layout/Layout";
import { FaqSection } from "../../components/ui/faq-section";

const faqs = [
  {
    question: "How does Pull-Up Club pay out prize money?",
    answer: "We use Stripe Connect to send prize payouts directly to winners. It's fast, secure, and global. Once you win, we'll prompt you to create a free Stripe Express account (if you haven't already), and from there, we can transfer prize money directly to your bank account."
  },
  {
    question: "What kind of things can win me money?",
    answer: "We love creativity, commitment, and community. In addition to leaderboard-based wins, we reward standout entries in all kinds of categories. Here are a few examples: 🎽 Wearing Battle Bunker gear, 🏋️‍♂️ Using Battle Bunker equipment, 🎶 Best music selection, 👕 Best costume or theme, 🎬 Best video intro and/or outro, 🤯 Wildest surprise or unexpected twist, 💥 Most hype energy, 🧼 Cleanest reps. If your video makes us pause, laugh, or replay — you're probably getting paid."
  },
  {
    question: "Do I have to win the challenge to get prize money?",
    answer: "Nope! Winning isn't everything here. We reward creativity, effort, and community spirit. You might not top the leaderboard, but if your entry stands out, there's a good chance you'll get a surprise cash prize."
  },
  {
    question: "Are there any content restrictions, like nudity?",
    answer: "❌ Any form of nudity will result in immediate video rejection. Participants must be dressed appropriately, as if working out in a public gym."
  },
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
    answer: "You can upload your video to any public platform such as YouTube, Instagram, or TikTok. Just make sure your privacy settings allow us to view it without logging in or requesting access."
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

const FAQPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">FAQ</h1>
        </div>
        <FaqSection
          items={faqs}
        />
      </div>
    </Layout>
  );
};

export default FAQPage;
