import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
    updateAge: 60 * 60 // 1 hora
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email y contraseña son requeridos');
          }

          // Llamada a tu API backend
          const res = await fetch('http://backend:4000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: credentials.email, 
              password: credentials.password 
            }),
          });

          const response = await res.json();
          console.log(response);
          const { user, token } = response;

           if ('error' in response) {
            throw new Error(response.error || 'Error en la autenticación');
          }

          if (!response.user) {
            throw new Error('Usuario no encontrado');
          }

          if (!response.user.activo) {
            throw new Error('Usuario inactivo');
          }

          return {
            id: user.id.toString(),
            name: user.nombre,
            email: user.correo,
            role: user.rol,
            telefono: user.telefono,
            activo: user.activo,
            accessToken: token
          };
        } catch (error) {
          console.error('Error en autenticación:', error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Guardar todos los datos del usuario en el token
        token.id = user.id;
        token.role = user.role || user.rol;
        token.telefono = user.telefono;
        token.activo = user.activo;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          rol: token.rol,
          telefono: token.telefono,
          activo: token.activo
        };
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login?error=',
    signOut: '/auth/login'
  }
};

export const handlers = {
  GET: async (req, ctx) => {
    return NextAuth(req, ctx, authOptions);
  },
  POST: async (req, ctx) => {
    return NextAuth(req, ctx, authOptions);
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, handler as default };