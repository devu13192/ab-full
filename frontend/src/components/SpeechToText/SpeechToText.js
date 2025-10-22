import React, { useState, useEffect } from "react";

const SpeechToText = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const recognition = new window.webkitSpeechRecognition();

  useEffect(() => {
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setText(result);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  }, [recognition]);
  // useEffect(()=>{
  //   handleStartRecording();
  // },[])
  const handleStartRecording = () => {
    setIsRecording(true);
    recognition.start();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    recognition.stop();
  };

  return (
    <div >
    </div>
  );
};

export default SpeechToText;
