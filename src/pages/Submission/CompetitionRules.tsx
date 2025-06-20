import React from 'react';

const CompetitionRules: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Official Video Submission Rules
      </h2>
      <p className="text-gray-300 mb-6">
        To ensure fairness, consistency, and integrity across all entries, all participants must adhere to the following Video Submission Requirements. Any video submission that fails to meet any of these criteria may be denied without notice. If you are a member of the Pull-Up Club and pay the monthly fee, you are allowed one video submission per month.
      </p>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-bold text-white mb-3">1. Clear and Unobstructed View</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>The entire body and bar must be clearly visible at all times throughout the video.</li>
            <li>Camera angle must not hide or obscure key points of movement (e.g., chin, arms, lockout position).</li>
            <li>Avoid dark lighting, excessive backlighting, or shaky camera work. Stabilize your shot before beginning.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">2. Proper Form Requirements</h3>
          <p className="text-gray-300 mb-2">To count as a valid rep, each repetition must meet the following standards:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Chin Over Bar: The athlete's chin must clearly rise above the horizontal plane of the bar for each rep.</li>
            <li>Full Extension: Arms must reach full extension (elbows locked out) at the bottom of every repetition.</li>
            <li>Reps performed with kipping, swinging, or partial range of motion may not be counted at our discretion.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">3. Continuous Recording</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>The video must be captured in one continuous take from start to finish, no cuts, edits, slow motion, or time skips.</li>
            <li>Ensure the recording starts before the first rep and continues until after the final rep is completed.</li>
            <li>Do not crop or splice footage in post-production.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">4. Video Authenticity</h3>
          <p className="text-gray-300 mb-2">Your submission must be 100% real, unaltered footage. By submitting, you agree that:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>The video is not generated, enhanced, or altered by any AI tools.</li>
            <li>The video is not manipulated using looping, layering, or time edits to falsely extend or improve performance.</li>
            <li>Any submission found to violate this will be automatically disqualified.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">5. Public Access</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Your video must be publicly accessible on a platform like Instagram, TikTok, YouTube or Facebook.</li>
            <li>Private, password-protected, or expired links will not be reviewed or counted.</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <p className="text-gray-300 text-sm">
          By submitting your video, you acknowledge and accept these rules in full. We reserve the right to deny any submission that does not clearly meet these standards.
        </p>
      </div>
    </div>
  );
};

export default CompetitionRules;