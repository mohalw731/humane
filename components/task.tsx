import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  Query,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/configs/firebase';
import useUserData from '@/hooks/useUser';


export interface Todo {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
}

const TodoList = () => {
  const { user, loading } = useUserData(); // Assuming you have a custom hook to get user data
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch todos for the current user
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user) {
      try {
        const q: Query<DocumentData> = query(
          collection(db, 'todos'),
          where('userId', '==', user.uid)
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const todosData: Todo[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            todosData.push({
              id: doc.id,
              text: data.text,
              userId: data.userId,
              createdAt: data.createdAt.toDate()
            });
          });
          setTodos(todosData);
        });
      } catch (err) {
        setError('Failed to fetch todos');
        console.error('Error fetching todos:', err);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addTodo = async (): Promise<void> => {
    if (!newTodo.trim()) {
      setError('Todo cannot be empty');
      return;
    }

    if (!user) {
      setError('You must be logged in to add todos');
      return;
    }

    try {
      await addDoc(collection(db, 'todos'), {
        text: newTodo,
        userId: user.uid,
        createdAt: new Date()
      });
      setNewTodo('');
      setError(null);
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your todos</div>;

  return (
    <div className="todo-container">
      <h2>Your Todo List</h2>
      
      {error && <div className="error-message">{error}</div>}
      
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
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;