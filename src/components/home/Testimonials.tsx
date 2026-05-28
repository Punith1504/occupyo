import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "Occupyo completely transformed how we found our new headquarters. The transparent pricing and streamlined process saved us weeks of negotiation.",
    author: "Sarah Jenkins",
    role: "CEO, TechFlow",
    rating: 5,
  },
  {
    id: 2,
    content: "As a landlord, managing flexible leases used to be a nightmare. Now, everything from booking to billing is handled in one seamless dashboard.",
    author: "Marcus Thorne",
    role: "Managing Director, Thorne Properties",
    rating: 5,
  },
  {
    id: 3,
    content: "The best commercial real estate platform on the market. We secured a premium co-working space in Brooklyn within 48 hours.",
    author: "Elena Rodriguez",
    role: "Founder, CreativeStudio",
    rating: 5,
  }
];

export function Testimonials() {
  // JSON-LD Review Aggregation Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Occupyo Commercial Real Estate Platform",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "128"
    },
    "review": testimonials.map(t => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating.toString()
      },
      "author": {
        "@type": "Person",
        "name": t.author
      },
      "reviewBody": t.content
    }))
  };

  return (
    <section className="py-24 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Don't just take our word for it</h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Join hundreds of forward-thinking companies who have already found their perfect space.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors duration-300">
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                ))}
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          {/* eslint-disable-next-line react/no-unescaped-entities */}
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-white/50 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </section>
  );
}
