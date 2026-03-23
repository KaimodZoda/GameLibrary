import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
      <Container className="text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Game Library</h2>
        <p className="text-xl mb-8">Browse, borrow, and manage your favorite games</p>
        <div className="flex justify-center space-x-4">
          <Button variant="secondary" size="lg">
            <i className="fas fa-gamepad mr-2"></i>Browse Games
          </Button>
          <Button variant="outline" size="lg">
            <i className="fas fa-plus mr-2"></i>Add Game
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
