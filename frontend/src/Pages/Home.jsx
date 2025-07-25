       // Import Footer
 
import Header from "../component/Header";

import FutureEventsView from "./EventFutre";
import FeaturedOrganizers from "./FeaturedOrganizers";
import PublicHighlights from "./PublicHighlights";

const Home = () => {
  return (
    <div className="font-sans antialiased"> {/* Apply a base font */}
    <Header/>
      <FutureEventsView/>
      <PublicHighlights/>
      <FeaturedOrganizers/>
    </div>
  );
};

export default Home;