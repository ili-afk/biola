import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
import { REFERENCE_DATA } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reference' | 'test' | 'results'>('reference');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [answers, setAnswers] = useState<any>(() => {
    const saved = localStorage.getItem('bio9_answers');
    return saved ? JSON.parse(saved) : {
      q1: '', q2: '', q3: '', q4: '', q5: [],
      q6_name: '', q6_func: '', q7_name: '', q7_func: '',
      q8: { A: '', B: '', C: '', D: '', E: '' }, q9: '', q10: ''
    };
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!isSubmitted) localStorage.setItem('bio9_answers', JSON.stringify(answers));
  }, [answers, isSubmitted]);

  const handleObjChange = (q: string, k: string, val: string) => {
    setAnswers((p: any) => ({ ...p, [q]: { ...p[q], [k]: val } }));
  };

  const handleCheckboxChange = (q: string, val: string) => {
    setAnswers((p: any) => {
      const cur = p[q];
      return cur.includes(val) 
        ? { ...p, [q]: cur.filter((v: string) => v !== val) }
        : { ...p, [q]: [...cur, val] };
    });
  };

  const checkAnswers = () => {
    let totalScore = 0;
    const res: any = {};
    const sanitize = (s: string) => (s || '').toLowerCase().trim();

    res.q1 = { score: answers.q1 === 'Б' ? 1 : 0, max: 1, exp: 'Почки (Б)' };
    res.q2 = { score: answers.q2 === 'Б' ? 1 : 0, max: 1, exp: 'Желудочного сока (Б)' };
    res.q3 = { score: answers.q3 === 'В' ? 1 : 0, max: 1, exp: 'Вода и минеральные соли (В)' };
    res.q4 = { score: answers.q4 === 'Б' ? 1 : 0, max: 1, exp: 'Дерме (Б)' };
    
    // Q5
    const h3 = answers.q5.includes('3');
    const h4 = answers.q5.includes('4');
    let q5S = (h3 && h4 && answers.q5.length === 2) ? 2 : ((h3 || h4) && answers.q5.length <= 2 ? 1 : 0);
    res.q5 = { score: q5S, max: 2, exp: 'Верны утверждения 3 и 4.' };

    // Q6
    const n6 = sanitize(answers.q6_name), f6 = sanitize(answers.q6_func);
    let q6S = 0;
    if (n6.includes('гортань')) q6S++;
    if (f6.includes('воздух') || f6.includes('провод') || f6.includes('голос') || f6.includes('звук')) q6S++;
    res.q6 = { score: q6S, max: 2, exp: 'Гортань. Проведение воздуха и голосообразование.' };

    // Q7
    const n7 = sanitize(answers.q7_name), f7 = sanitize(answers.q7_func);
    let q7S = 0;
    if (n7.includes('эпидермис')) q7S++;
    if (f7.includes('защит') || f7.includes('покров')) q7S++;
    res.q7 = { score: q7S, max: 2, exp: 'Эпидермис. Защитная.' };

    // Q8
    let mistakes = 0;
    const q8Corr: any = { A: '2', B: '1', C: '1', D: '2', E: '1' };
    ['A','B','C','D','E'].forEach(k => { if (answers.q8[k] !== q8Corr[k]) mistakes++; });
    res.q8 = { score: mistakes === 0 ? 2 : (mistakes === 1 ? 1 : 0), max: 2, exp: '21121' };

    // Q9
    const a9 = sanitize(answers.q9);
    let q9S = 0;
    if (a9.includes('обмен') || a9.includes('реакц')) q9S++;
    if (a9.includes('энерг') || a9.includes('пластич') || a9.includes('ассим') || a9.includes('диссим')) q9S++;
    res.q9 = { score: q9S, max: 2, exp: 'Обмен веществ (химич. реакции), пластический и энергетический.' };

    // Q10
    const a10 = sanitize(answers.q10);
    let q10S = 0;
    if (a10.includes('орг') || a10.includes('веществ')) q10S++;
    if (a10.includes('не энерг') || a10.includes('не явл') || a10.includes('нет энерг') || a10.includes('не строит')) q10S++;
    res.q10 = { score: q10S, max: 2, exp: 'Органические вещества. Отличие: не дают энергии и не явл. структурным материалом.' };

    Object.values(res).forEach((r: any) => { totalScore += r.score; });
    const grade = totalScore >= 14 ? 5 : totalScore >= 11 ? 4 : totalScore >= 7 ? 3 : 2;
    setResults({ breakdown: res, totalScore, maxTotal: 16, grade });
    setIsSubmitted(true);
    setActiveTab('results');
    window.scrollTo(0, 0);
  };

  const resetTest = () => {
    if(window.confirm('Сбросить тест?')) {
      setAnswers({
        q1: '', q2: '', q3: '', q4: '', q5: [],
        q6_name: '', q6_func: '', q7_name: '', q7_func: '',
        q8: { A: '', B: '', C: '', D: '', E: '' }, q9: '', q10: ''
      });
      setIsSubmitted(false);
      setResults(null);
      localStorage.removeItem('bio9_answers');
      setActiveTab('test');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#2d3a31] font-sans pb-20 flex flex-col">
      <header className="h-auto sm:h-20 bg-white border-b border-emerald-100 flex items-center justify-center sm:justify-between px-4 sm:px-10 shadow-sm sticky top-0 z-10 mb-8 py-4 sm:py-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-5xl mx-auto w-full justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">Б</div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-900">Биология 9: Подготовка к ПА и ОГЭ</h1>
          </div>
          <nav className="flex gap-2 bg-emerald-50 p-1 rounded-xl mt-4 sm:mt-0">
            {[{id:'reference', l:'Справочник', i: BookOpen}, {id:'test', l:'Тест', i: FileText}, {id:'results', l:'Результаты', i: BarChart2}].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${activeTab === t.id ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-100 text-[#2d3a31]'}`}>
                <t.i size={18} /> <span>{t.l}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8">
        {activeTab === 'reference' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-2 underline decoration-emerald-200 underline-offset-8">Краткий конспект для подготовки</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REFERENCE_DATA.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded-2xl border border-emerald-100 shadow-sm flex flex-col">
                  <button className="w-full px-4 py-3 text-left font-bold text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors" onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}>
                    {idx + 1}. {item.title}
                  </button>
                  {openAccordion === idx && <div className="px-4 pb-4 pt-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-inner space-y-10">
            <h2 className="text-2xl font-bold text-emerald-900 border-b border-emerald-100 pb-4">Тренировочный тест</h2>
            
            {/* Q1-Q4 */}
            {[
              { q: 'q1', text: '1. Главным органом выделительной системы является:', opts: ['А) мочевой пузырь', 'Б) почки', 'В) мочеточники', 'Г) печень'] },
              { q: 'q2', text: '2. Соляная кислота входит в состав:', opts: ['А) слюны', 'Б) желудочного сока', 'В) поджелудочного сока', 'Г) кишечного сока'] },
              { q: 'q3', text: '3. Источником энергии для организма не могут являться:', opts: ['А) жиры', 'Б) белки', 'В) вода и минеральные соли', 'Г) углеводы'] },
              { q: 'q4', text: '4. Потовые железы расположены в:', opts: ['А) эпидермисе', 'Б) дерме', 'В) гиподерме', 'Г) жировой клетчатке'] }
            ].map(item => (
              <div key={item.q} className="mb-10">
                <p className="font-bold mb-4">{item.text}</p>
                <div className="flex flex-wrap gap-4">
                  {item.opts.map(opt => (
                    <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors border ${answers[item.q] === opt[0] ? 'bg-emerald-100 border-emerald-400' : 'bg-emerald-50 border-transparent hover:bg-emerald-100'}`}>
                      <input type="radio" name={item.q} value={opt[0]} checked={answers[item.q] === opt[0]} onChange={e => setAnswers({...answers, [item.q]: e.target.value})} className="accent-emerald-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Q5 */}
            <div className="mb-10">
              <p className="font-bold mb-4">5. Анализ графика S-образной кривой роста популяции (рост, ускорение, замедление к 40-му дню):</p>
              <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                <svg viewBox="0 0 200 150" className="w-full max-w-[200px] bg-white border border-gray-200 shadow-sm rounded-lg p-2">
                  <polyline points="20,130 20,20" fill="none" stroke="#4b5563" strokeWidth="2" />
                  <polyline points="20,130 180,130" fill="none" stroke="#4b5563" strokeWidth="2" />
                  <path d="M 20 130 C 60 130, 80 40, 150 30" fill="none" stroke="#059669" strokeWidth="3" />
                  <text x="170" y="145" fontSize="10" fill="#4b5563">Дни</text> <text x="5" y="15" fontSize="10" transform="rotate(-90 5 15)" fill="#4b5563">Особи</text>
                </svg>
                <div className="flex flex-col gap-3 text-sm">
                  {['1) В момент 0 скорость 0.', '2) С 15-30 день скорость линейно растет.', '3) Макс. скорость на 30-й день.', '4) Скорость плавно растет, затем снижается.'].map((opt, i) => (
                    <label key={opt} className={`flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-emerald-50 transition-colors ${answers.q5.includes((i+1).toString()) ? 'bg-emerald-50' : ''}`}>
                      <input type="checkbox" checked={answers.q5.includes((i+1).toString())} onChange={() => handleCheckboxChange('q5', (i+1).toString())} className="mt-1 accent-emerald-600 w-4 h-4" />
                      <span className="font-medium text-[#2d3a31]">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Q6 */}
            <div className="mb-10">
              <p className="font-bold mb-2">6. На схеме под цифрой 3 указана структура. Название и функция?</p>
              <div className="text-[10px] text-gray-400 mb-4 italic">[1-Нос, 2-Глотка, 3-?, 4-Трахея, 5-Бронхи, 6-Легкие]</div>
              <div className="mb-4">
                <svg viewBox="0 0 160 180" className="w-full max-w-[120px] bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <rect x="60" y="20" width="40" height="20" fill="#f3f4f6" stroke="#9ca3af"/><text x="80" y="34" fontSize="12" textAnchor="middle" fill="#4b5563">1</text>
                  <rect x="60" y="50" width="40" height="20" fill="#d1fae5" stroke="#059669"/><text x="80" y="64" fontSize="12" textAnchor="middle" fill="#065f46" fontWeight="bold">3</text>
                  <rect x="70" y="80" width="20" height="30" fill="#f3f4f6" stroke="#9ca3af"/><text x="80" y="100" fontSize="12" textAnchor="middle" fill="#4b5563">4</text>
                  <circle cx="50" cy="140" r="20" fill="#f3f4f6" stroke="#9ca3af"/><circle cx="110" cy="140" r="20" fill="#f3f4f6" stroke="#9ca3af"/>
                </svg>
              </div>
              <div className="space-y-3">
                <input type="text" value={answers.q6_name} onChange={e => setAnswers({...answers, q6_name: e.target.value})} placeholder="Название..." className="w-full border-b-2 border-emerald-200 focus:border-emerald-600 outline-none p-2 bg-transparent transition-colors" />
                <input type="text" value={answers.q6_func} onChange={e => setAnswers({...answers, q6_func: e.target.value})} placeholder="Функция..." className="w-full border-b-2 border-emerald-200 focus:border-emerald-600 outline-none p-2 bg-transparent transition-colors" />
              </div>
            </div>

            {/* Q7 */}
            <div className="mb-10">
              <p className="font-bold mb-4">7. Строение кожи, цифра 1. Название и функция?</p>
              <div className="mb-4">
                <svg viewBox="0 0 160 100" className="w-full max-w-[160px] bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <rect x="20" y="20" width="120" height="15" fill="#fef08a" stroke="#eab308"/><text x="80" y="32" fontSize="12" textAnchor="middle" fill="#854d0e">1</text>
                  <rect x="20" y="40" width="120" height="40" fill="#f3f4f6" stroke="#9ca3af"/><text x="80" y="60" fontSize="12" textAnchor="middle" fill="#4b5563">2</text>
                </svg>
              </div>
              <div className="space-y-3">
                <input type="text" value={answers.q7_name} onChange={e => setAnswers({...answers, q7_name: e.target.value})} placeholder="Название..." className="w-full border-b-2 border-emerald-200 focus:border-emerald-600 outline-none p-2 bg-transparent transition-colors" />
                <input type="text" value={answers.q7_func} onChange={e => setAnswers({...answers, q7_func: e.target.value})} placeholder="Функция..." className="w-full border-b-2 border-emerald-200 focus:border-emerald-600 outline-none p-2 bg-transparent transition-colors" />
              </div>
            </div>

            {/* Q8 */}
            <div className="mb-10">
              <p className="font-bold mb-4">8. Соответствие (А-окисление, Б-полимеры, В-трата АТФ, Г-выделение энергии, Д-синтез):</p>
              <div className="text-[10px] text-gray-500 font-medium mb-3 uppercase tracking-wider">1 — пластический, 2 — энергетический</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[ { id: 'A', label: 'А' }, { id: 'B', label: 'Б' }, { id: 'C', label: 'В' }, { id: 'D', label: 'Г' }, { id: 'E', label: 'Д' } ].map(item => (
                  <div key={item.id} className="text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-sm font-bold text-gray-700 mb-2">{item.label}</div>
                    <select value={answers.q8[item.id]} onChange={e => handleObjChange('q8', item.id, e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white outline-none focus:border-emerald-500">
                      <option value="">-</option><option value="1">1</option><option value="2">2</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Q9, Q10 */}
            {[ { q: 'q9', text: '9. Определение метаболизму и его виды.' }, { q: 'q10', text: '10. Определение витаминам и гл. отличие от других веществ.' } ].map(item => (
              <div key={item.q} className="mb-10">
                <p className="font-bold mb-4">{item.text}</p>
                <textarea rows={2} value={answers[item.q]} onChange={e => setAnswers({...answers, [item.q]: e.target.value})} className="w-full p-4 border border-emerald-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-emerald-500 transition-colors resize-none" placeholder="Ваш ответ..." />
              </div>
            ))}

            <div className="text-center pt-4">
              <button onClick={checkAnswers} className="bg-emerald-600 text-white px-10 py-4 w-full sm:w-auto rounded-full font-bold shadow-lg shadow-emerald-200 hover:-translate-y-1 hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto">
                <CheckCircle size={22} /> Проверить результаты
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="flex flex-col items-center justify-center text-center mt-8">
            {!results ? (
              <div className="text-center p-12 bg-white rounded-[40px] border-2 border-emerald-100 shadow-xl max-w-xl w-full">
                <AlertCircle className="mx-auto text-emerald-400 mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-6 text-emerald-900">Результатов пока нет</h2>
                <button onClick={() => setActiveTab('test')} className="bg-emerald-600 text-white py-3 px-8 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all">Пройти тест</button>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-12 rounded-[40px] border-2 border-emerald-100 shadow-xl max-w-2xl w-full">
                <div className="text-6xl sm:text-7xl font-black text-emerald-600 mb-2">{results.totalScore}</div>
                <div className="text-xl text-emerald-800 font-medium mb-6 italic">баллов из {results.maxTotal}</div>
                <div className="text-2xl sm:text-3xl font-bold bg-emerald-50 inline-block px-8 py-3 rounded-2xl border border-emerald-200 mb-8 text-emerald-900">Оценка: {results.grade}</div>
                
                <div className="grid grid-cols-2 gap-4 text-left text-sm mb-10 w-full max-w-sm mx-auto">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <b className="text-gray-700 block mb-1">Шкала:</b>
                    <span className="text-emerald-700 font-medium">14-16: Отлично (5)</span><br/>
                    <span className="text-emerald-600">11-13: Хорошо (4)</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <b className="text-gray-700 block mb-1">Норма:</b>
                    <span className="text-orange-600">7-10: Удовл. (3)</span><br/>
                    <span className="text-red-600">0-6: Неуд. (2)</span>
                  </div>
                </div>

                <div className="text-left bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-8 max-h-[400px] overflow-y-auto w-full text-sm">
                  {['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'].map((q, i) => {
                    const r = results.breakdown[q];
                    return (
                      <div key={q} className={`p-4 border-b last:border-b-0 ${r.score === r.max ? 'bg-emerald-50/30' : r.score > 0 ? 'bg-yellow-50/30' : 'bg-red-50/30'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-700">Вопрос {i+1}</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${r.score === r.max ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-800'}`}>{r.score}/{r.max}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-mono text-xs">{r.exp}</p>
                      </div>
                    );
                  })}
                </div>

                <button onClick={resetTest} className="text-emerald-600 font-bold hover:underline transition-all">Попробовать еще раз</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
