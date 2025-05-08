import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/configs/firebase'; // Your Firebase config file
import useUserData from '@/hooks/useUser';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const {user, loading} = useUserData(); // Custom hook to get user data

  // Fetch todos for the current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'todos'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosData = [];
      querySnapshot.forEach((doc) => {
        todosData.push({ id: doc.id, ...doc.data() });
      });
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, [user]);

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'todos'), {
        text: newTodo,
        userId: user.uid,
        createdAt: new Date()
      });
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your todos</div>;

  return (
    <div className="todo-container">
      <h2>Your Todo List</h2>
      
      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;