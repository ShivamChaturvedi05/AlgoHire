import { useState, useEffect } from 'react';
import questionService from '../../services/questionService';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", isHidden: false }]);
  const [saving, setSaving] = useState(false);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  };

  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await questionService.getQuestions();
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setSaving(true);
    try {
      const res = await questionService.createQuestion(newTitle, newDesc, testCases);
      setQuestions([res.data, ...questions]);
      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      setTestCases([{ input: "", expectedOutput: "", isHidden: false }]);
    } catch (err) {
      console.error("Failed to create question", err);
      alert("Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await questionService.deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Question Bank...</div>;

  return (
    <>
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden min-h-[300px]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Questions</h3>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            + Add New Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Build your question bank here. You can easily access and send these questions to candidates during live interviews.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {questions.map((q) => (
              <li key={q._id} className="p-6 hover:bg-white/60 dark:hover:bg-gray-800/80 transition duration-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{q.title}</h4>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800">{q.description}</pre>
                  </div>
                  <button 
                    onClick={() => handleDelete(q._id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold shrink-0 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Question</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Validate Binary Search Tree"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description / Prompt</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Given the root of a binary tree, determine if it is a valid binary search tree (BST)..."
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm resize-y"
                  required
                />
              </div>
              <div className="mb-6 max-h-72 overflow-y-auto pr-2 border-t border-gray-200 dark:border-gray-700 pt-4 custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Test Cases</label>
                  <button type="button" onClick={handleAddTestCase} className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1.5 rounded-md font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors shadow-sm">+ Add Test Case</button>
                </div>
                {testCases.map((tc, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 relative shadow-sm">
                    {testCases.length > 1 && (
                      <button type="button" onClick={() => handleRemoveTestCase(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">&times;</button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Input (stdin)</label>
                        <textarea rows="2" value={tc.input} onChange={e => handleTestCaseChange(index, 'input', e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-y" placeholder="1 2 3..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expected Output (stdout) *</label>
                        <textarea rows="2" value={tc.expectedOutput} onChange={e => handleTestCaseChange(index, 'expectedOutput', e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-y" required placeholder="6" />
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={tc.isHidden} onChange={e => handleTestCaseChange(index, 'isHidden', e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600" />
                      <span className="font-medium">Hidden Test Case <span className="text-xs font-normal text-gray-500">(Candidate won't see input/output)</span></span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                >
                  {saving ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionBank;
