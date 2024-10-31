import React from 'react';
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import TopLinks from "@/components/topLinks";

const About: React.FC = () => {
  return (
    <div className="bg-scanlines bg-custom-purple"> {/* Base background */}
      <PageHeader title="About HasTok" />
      <TopLinks />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-white">
          HasanAbi, Hasan Piker, is a left-wing online political commentator and streamer.
        </p>
        <p className="text-white">I&apos;m &quot;chase_saddy&quot; around <a href="https://twitter.com/chase_saddy" className="text-blue-500">Twitter</a>, <a href="https://twitch.tv/chase_saddy" className="text-blue-500">Twitch</a>. 
          My Hasan &quot;brand&quot; on <a href="https://tiktok.com/HasansProducer" className="text-blue-500">Tiktok</a>, <a href="https://twitter.com/HasansProducer" className="text-blue-500">Twitter</a>.
        </p>
        <p className="text-white">The Twitter of the general umbrella of HasanAbiTV.com is <a href="https://twitter.com/HasanAbisTV" className="text-blue-500">HasanAbisTV</a>.
        </p>
        <br />
        <p className="text-white">
          It costs roughly $1 a day for TikTok API usage. It costs a variable amount of money for the Twitter API upkeep. I pay these out of pocket right now. There&apos;s Patreon/BuyMeaCoffee coming for support with costs and future development.
        </p>
        <p className="text-white">
          I&apos;m looking for people to help contribute and maintain the data for these Hasan fan sites. The HasTok and the overall HasanAbiTV site are still in beta. DM me anywhere for any support, requests, or concerns.
        </p>
        <p className="text-white">
          I&apos;m using Linear for task/project management. There is a T0ggles dashboard for the overall roadmap.
        </p>
      </div>

    <Footer />
    </div>
  );
};

export default About;