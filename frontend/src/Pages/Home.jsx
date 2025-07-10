       // Import Footer
 
import Header from "../component/Header";
import ImageGallery from "../component/ImageGallery";
import MainContent from "../component/MainContent";

const Home = () => {
  return (
    <div className="font-sans antialiased"> {/* Apply a base font */}
    <Header/>
      <MainContent />
      <ImageGallery />
     
    </div>
  );
};

export default Home;