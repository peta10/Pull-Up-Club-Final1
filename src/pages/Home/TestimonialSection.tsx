import React from 'react';

const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Battle Bunker's Pull-Up Challenge pushed me to my limits. I went from 15 to 25 pull-ups in just two months of training for this competition!",
      author: "Mike Johnson",
      role: "CrossFit Athlete",
      imageSrc: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      quote: "The leaderboard feature keeps me motivated. Seeing my name climb up the rankings each week is incredibly satisfying.",
      author: "Sarah Williams",
      role: "Battle Bunker Elite Member",
      imageSrc: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      quote: "As a gym owner, I love how this platform has created friendly competition among my members. Everyone's training harder!",
      author: "Dave Rodriguez",
      role: "Owner, Iron Warriors Gym",
      imageSrc: "https://images.pexels.com/photos/5088188/pexels-photo-5088188.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">What Participants Say</h2>
          <div className="w-20 h-1 bg-[#9b9b6f] mx-auto mt-4 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <svg className="h-8 w-8 text-[#9b9b6f] mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.imageSrc} 
                    alt={testimonial.author}
                    className="h-10 w-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;