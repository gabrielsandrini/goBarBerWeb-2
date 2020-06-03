import { createContext } from 'react';

interface AuthContextType {
  name: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default AuthContext;
