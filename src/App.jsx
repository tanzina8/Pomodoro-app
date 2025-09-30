import { useState, useEffect } from "react";
import './App.css';

function App() {
  // Timer states
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(10);
  const [mode, setMode] = useState("pomodoro"); // pomodoro | shortBreak | longBreak
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [studySeconds, setStudySeconds] = useState(0);

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskPomodoros, setTaskPomodoros] = useState(1);

  // Sounds
  const sounds = {
    start: new Audio("/sounds/start.mp3"),
    pause: new Audio("/sounds/pause.mp3"),
    shortBreak: new Audio("/sounds/short-break.mp3"),
    longBreak: new Audio("/sounds/long-break.mp3"),
  };

  // Format seconds -> mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle ticking
  useEffect(() => {
    let timer;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
        if (mode === "pomodoro") setStudySeconds((prev) => prev + 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);

      if (mode === "pomodoro") {
        setCompletedCycles((c) => c + 1);

        if ((completedCycles + 1) % 4 === 0) {
          setMode("longBreak");
          setSecondsLeft(longBreakMinutes * 60);
          sounds.longBreak.play();
        } else {
          setMode("shortBreak");
          setSecondsLeft(shortBreakMinutes * 60);
          sounds.shortBreak.play();
        }
      } else if (mode === "shortBreak") {
        setMode("pomodoro");
        setSecondsLeft(workMinutes * 60);
        sounds.start.play();
      } else if (mode === "longBreak") {
        setMode("pomodoro");
        setSecondsLeft(workMinutes * 60);
        sounds.start.play();
      }
    }
    return () => clearInterval(timer);
  }, [
    isRunning,
    secondsLeft,
    mode,
    completedCycles,
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
  ]);

  // Start / Pause
  const toggleTimer = () => {
    if (isRunning) {
      sounds.pause.play();
      setIsRunning(false);
    } else {
      if (mode === "pomodoro") sounds.start.play();
      if (mode === "shortBreak") sounds.shortBreak.play();
      if (mode === "longBreak") sounds.longBreak.play();
      setIsRunning(true);
    }
  };

  // Reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restart the timer?")) {
      setIsRunning(false);
      setMode("pomodoro");
      setSecondsLeft(workMinutes * 60);
      setCompletedCycles(0);
      setStudySeconds(0);
    }
  };

  // Task functions
  const addTask = () => {
    if (taskName.trim() !== "") {
      setTasks([
        ...tasks,
        { name: taskName, pomodoros: taskPomodoros, completed: false },
      ]);
      setTaskName("");
      setTaskPomodoros(1);
    }
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].completed = !updated[i].completed;
    setTasks(updated);
  };

  // Background colors based on mode
  const bgColor =
    mode === "pomodoro"
      ? "bg-blue-900"
      : mode === "shortBreak"
      ? "bg-green-900"
      : "bg-purple-900";

  return (
    <div
      className={`flex flex-col items-center justify-between min-h-screen ${bgColor} text-white p-6 transition-colors duration-500`}
    >
      {/* Tabs */}
      <div className="flex shadow-lg rounded-lg overflow-hidden mb-8">
        <button
          onClick={() => {
            setMode("pomodoro");
            setSecondsLeft(workMinutes * 60);
            setIsRunning(false);
          }}
          className={`px-6 py-2 font-bold ${
            mode === "pomodoro"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => {
            setMode("shortBreak");
            setSecondsLeft(shortBreakMinutes * 60);
            setIsRunning(false);
          }}
          className={`px-6 py-2 font-bold ${
            mode === "shortBreak"
              ? "bg-green-600 text-white"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => {
            setMode("longBreak");
            setSecondsLeft(longBreakMinutes * 60);
            setIsRunning(false);
          }}
          className={`px-6 py-2 font-bold ${
            mode === "longBreak"
              ? "bg-purple-600 text-white"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          Long Break
        </button>
      </div>

{/* Timer Box */}
<div className={`timer-box ${mode} flex flex-col items-center justify-center mb-8`}>
  <h2 className="text-4xl mb-6 font-semibold tracking-widest drop-shadow">
    {mode === "pomodoro"
      ? "Pomodoro"
      : mode === "shortBreak"
      ? "Short Break"
      : "Long Break"}
  </h2>
  <p className="text-[6rem] font-extrabold mb-8 font-mono drop-shadow-2xl">
    {formatTime(secondsLeft)}
  </p>
  <div className="flex gap-8">
    <button
      onClick={toggleTimer}
      className="px-8 py-4 bg-green-500 rounded-xl hover:bg-green-600 font-bold text-2xl shadow-lg transition"
    >
      {isRunning ? "Pause" : "Start"}
    </button>
    {/* Reset button removed */}
  </div>
</div>




      {/* Task list */}
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg shadow-lg mt-8">
        <h3 className="mb-3 text-xl font-bold">Tasks</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task name"
            className="flex-1 p-2 rounded text-black"
          />
          <input
            type="number"
            min="1"
            value={taskPomodoros}
            onChange={(e) => setTaskPomodoros(Number(e.target.value))}
            className="w-20 p-2 rounded text-black"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-slate-700 px-3 py-2 rounded"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(i)}
                className="w-5 h-5"
              />
              <span
                className={`${
                  task.completed ? "line-through opacity-60" : ""
                }`}
              >
                {task.name} ({task.pomodoros} pomodoros)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
