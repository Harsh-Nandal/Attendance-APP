import { useEffect, useState } from 'react';

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice) => {
        console.log(choice.outcome);
      });
    }
  };

  return (
    <main>
      <h1>Welcome to Next.js PWA!</h1>
      <p>This is a simple PWA setup using next-pwa.</p>
      <button onClick={handleInstall}>Install App</button>
    </main>
  );
}
