import { useEffect, useState } from 'react';
import { useLifestyleData, useLogLifestyle } from '../hooks';
import { Coffee, Droplets, Moon, Zap, Plus, Minus, Clock, ChevronUp, ChevronDown } from 'lucide-react';

export function LifestyleScorecard() {
  const today = new Date().toISOString().split('T')[0];
  const { data: logs } = useLifestyleData(today, today);
  const logMutation = useLogLifestyle();

  const [coffee, setCoffee] = useState(0);
  const [water, setWater] = useState(0);
  const [bedtime24h, setBedtime24h] = useState('');
  const [wakeTime24h, setWakeTime24h] = useState('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);

  const formatIsoTo24h = (isoString: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hrs = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  useEffect(() => {
    if (logs && logs.length > 0) {
      const dayLog = logs[0];
      setCoffee(dayLog.coffee_cups);
      setWater(dayLog.water_cups);
      setBedtime24h(formatIsoTo24h(dayLog.bedtime));
      setWakeTime24h(formatIsoTo24h(dayLog.wake_time));
      setSleepQuality(dayLog.sleep_quality);
      setEnergyLevel(dayLog.energy_level);
    }
  }, [logs]);

  // Pure Time Calculation Layer
  const runSmartInference = (bedStr: string, wakeStr: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(bedStr) || !timeRegex.test(wakeStr)) {
      return { bedIso: null, wakeIso: null, duration: null };
    }

    const [bedH, bedM] = bedStr.split(':').map(Number);
    const [wakeH, wakeM] = wakeStr.split(':').map(Number);

    const wakeDate = new Date(today + 'T00:00:00');
    wakeDate.setHours(wakeH, wakeM, 0, 0);

    const bedDate = new Date(today + 'T00:00:00');
    if (bedH > wakeH || (bedH === wakeH && bedM > wakeM)) {
      bedDate.setDate(bedDate.getDate() - 1);
    }
    bedDate.setHours(bedH, bedM, 0, 0);

    const diffMs = wakeDate.getTime() - bedDate.getTime();
    const duration = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    return { bedIso: bedDate.toISOString(), wakeIso: wakeDate.toISOString(), duration };
  };

  // Safe time stepping utility (15 minute delta intervals)
  const calculateTimeStep = (currentTime: string, deltaMinutes: number, fallback: string): string => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    let [hrs, mins] = timeRegex.test(currentTime) 
      ? currentTime.split(':').map(Number) 
      : fallback.split(':').map(Number);

    let totalMins = hrs * 60 + mins + deltaMinutes;
    
    // Handle midnight wrapping bounds
    if (totalMins < 0) totalMins += 1440;
    if (totalMins >= 1440) totalMins %= 1440;

    const newHrs = Math.floor(totalMins / 60).toString().padStart(2, '0');
    const newMins = (totalMins % 60).toString().padStart(2, '0');
    return `${newHrs}:${newMins}`;
  };

  // Deliberate Write Triggers
  const handleTimeBlur = () => {
    const { bedIso, wakeIso } = runSmartInference(bedtime24h, wakeTime24h);
    logMutation.mutate({
      date: today, coffee_cups: coffee, water_cups: water,
      bedtime: bedIso, wake_time: wakeIso, sleep_quality: sleepQuality, energy_level: energyLevel
    });
  };

  const handleTimeStepClick = (type: 'bed' | 'wake', delta: number) => {
    let targetBed = bedtime24h;
    let targetWake = wakeTime24h;

    if (type === 'bed') {
      const nextBed = calculateTimeStep(bedtime24h, delta, '22:00');
      setBedtime24h(nextBed);
      targetBed = nextBed;
    } else {
      const nextWake = calculateTimeStep(wakeTime24h, delta, '07:00');
      setWakeTime24h(nextWake);
      targetWake = nextWake;
    }

    // Fire off immediate clean database upsert with fresh calculated time values
    const { bedIso, wakeIso } = runSmartInference(targetBed, targetWake);
    logMutation.mutate({
      date: today, coffee_cups: coffee, water_cups: water,
      bedtime: bedIso, wake_time: wakeIso, sleep_quality: sleepQuality, energy_level: energyLevel
    });
  };

  const saveQuickMetric = (updates: { coffee?: number; water?: number; quality?: number | null; energy?: number | null }) => {
    const { bedIso, wakeIso } = runSmartInference(bedtime24h, wakeTime24h);
    logMutation.mutate({
      date: today,
      coffee_cups: updates.coffee !== undefined ? updates.coffee : coffee,
      water_cups: updates.water !== undefined ? updates.water : water,
      bedtime: bedIso,
      wake_time: wakeIso,
      sleep_quality: updates.quality !== undefined ? updates.quality : sleepQuality,
      energy_level: updates.energy !== undefined ? updates.energy : energyLevel,
    });
  };

  const hoursSlept = runSmartInference(bedtime24h, wakeTime24h).duration;

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 backdrop-blur-md space-y-6">
      <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Daily Vitals</h3>

      {/* 1. Caffeine Intake */}
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300">Caffeine Intake</p>
            <p className="text-[10px] text-zinc-500">Cups consumed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
          <button
            type="button"
            onClick={() => { if (coffee > 0) { setCoffee(c => c - 1); saveQuickMetric({ coffee: coffee - 1 }); } }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 active:scale-90"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-mono text-sm font-bold text-zinc-200">{coffee}</span>
          <button
            type="button"
            onClick={() => { setCoffee(c => c + 1); saveQuickMetric({ coffee: coffee + 1 }); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 active:scale-90"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Fluid Hydration */}
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300">Water</p>
            <p className="text-[10px] text-zinc-500">Cups logged</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
          <button
            type="button"
            onClick={() => { if (water > 0) { setWater(w => w - 1); saveQuickMetric({ water: water - 1 }); } }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 active:scale-90"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-mono text-sm font-bold text-zinc-200">{water}</span>
          <button
            type="button"
            onClick={() => { setWater(w => w + 1); saveQuickMetric({ water: water + 1 }); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 active:scale-90"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Sleep Timeline with Integrated Control Steppers */}
      <div className="space-y-3 border-b border-zinc-900/60 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Sleep Timeline</span>
          </div>
          {hoursSlept !== null && hoursSlept > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-md">
              <Clock className="h-3 w-3" />
              <span>{hoursSlept} hrs tracked</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Bedtime Field Container */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Bedtime (24h)</label>
            <div className="relative flex items-center bg-zinc-950 border border-zinc-900 rounded-xl group focus-within:border-indigo-500/50 pr-1">
              <input
                type="text"
                placeholder="22:30"
                maxLength={5}
                inputMode="numeric"
                value={bedtime24h}
                onChange={(e) => setBedtime24h(e.target.value)}
                onBlur={handleTimeBlur}
                className="w-full text-center font-mono text-sm font-bold bg-transparent py-2.5 pl-7 text-zinc-200 outline-none"
              />
              <div className="flex flex-col text-zinc-500">
                <button type="button" onClick={() => handleTimeStepClick('bed', 15)} className="p-0.5 hover:text-zinc-200 active:scale-75">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleTimeStepClick('bed', -15)} className="p-0.5 hover:text-zinc-200 active:scale-75">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Wake Time Field Container */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Wake Time (24h)</label>
            <div className="relative flex items-center bg-zinc-950 border border-zinc-900 rounded-xl group focus-within:border-indigo-500/50 pr-1">
              <input
                type="text"
                placeholder="07:00"
                maxLength={5}
                inputMode="numeric"
                value={wakeTime24h}
                onChange={(e) => setWakeTime24h(e.target.value)}
                onBlur={handleTimeBlur}
                className="w-full text-center font-mono text-sm font-bold bg-transparent py-2.5 pl-7 text-zinc-200 outline-none"
              />
              <div className="flex flex-col text-zinc-500">
                <button type="button" onClick={() => handleTimeStepClick('wake', 15)} className="p-0.5 hover:text-zinc-200 active:scale-75">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleTimeStepClick('wake', -15)} className="p-0.5 hover:text-zinc-200 active:scale-75">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sleep Quality */}
      <div className="space-y-2 border-b border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Sleep Quality</span>
        </div>
        <div className="flex justify-between gap-1.5">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => { setSleepQuality(val); saveQuickMetric({ quality: val }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border active:scale-95
                ${sleepQuality === val
                  ? 'bg-indigo-500 text-zinc-950 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:text-zinc-400'
                }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Energy Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span>Energy Baseline</span>
        </div>
        <div className="flex justify-between gap-1.5">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => { setEnergyLevel(val); saveQuickMetric({ energy: val }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border active:scale-95
                ${energyLevel === val
                  ? 'bg-cyan-400 text-zinc-950 border-cyan-400 shadow-md shadow-cyan-400/10'
                  : 'bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:text-zinc-400'
                }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}