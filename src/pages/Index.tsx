import { SharedHeader } from "@/components/shared/SharedHeader";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { ContactForm } from "@/components/shared/ContactForm";

const demoUser = { id: "1", email: "mk@tobe.fan", username: "MK", initials: "MK" };

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Example 1 — cocktail.fan (logged out) */}
      <div className="mb-8">
        <div className="text-xs text-gray-400 px-6 py-2 bg-gray-100 font-mono">
          Example 1 — cocktail.fan · Logged out
        </div>
        <SharedHeader
          siteName="cocktail"
          siteEmoji="🍹"
          accentColor="#0C447C"
          aiFeatureLabel="AI Creator"
          demoUser={null}
        />
      </div>

      {/* Example 2 — car.fan (logged in, dropdown open) */}
      <div className="mb-8">
        <div className="text-xs text-gray-400 px-6 py-2 bg-gray-100 font-mono">
          Example 2 — car.fan · Logged in as MK · Dropdown open
        </div>
        <SharedHeader
          siteName="car"
          siteEmoji="🚗"
          accentColor="#1E3A5F"
          aiFeatureLabel="AI Garage"
          siteMenuFeatures={[
            { label: "My garage", icon: "🚗", path: "/my/garage" },
            { label: "My favourite cars", icon: "⭐", path: "/my/favourites" },
            { label: "Track day log", icon: "🏁", path: "/my/trackdays" },
          ]}
          demoUser={demoUser}
          demoAvatarOpen
        />
      </div>

      {/* Example 3 — boat.fan (logged in, dropdown open) */}
      <div className="mb-8">
        <div className="text-xs text-gray-400 px-6 py-2 bg-gray-100 font-mono">
          Example 3 — boat.fan · Logged in as MK · Dropdown open
        </div>
        <SharedHeader
          siteName="boat"
          siteEmoji="⛵"
          accentColor="#065F46"
          aiFeatureLabel="AI Navigator"
          siteMenuFeatures={[
            { label: "Nautical résumé", icon: "⚓", path: "/my/resume" },
            { label: "My boat logbook", icon: "📋", path: "/my/logbook" },
            { label: "Rental verification", icon: "✅", path: "/my/verification" },
          ]}
          demoUser={demoUser}
          demoAvatarOpen
        />
      </div>

      <SharedFooter />
    </div>
  );
};

export default Index;
