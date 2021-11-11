import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Routes, Route } from "react-router-dom";
import Launches from './pages/launches';
import Layout from './components/layout';

const client = new ApolloClient({
  uri: 'https://api.spacex.land/graphql/',
  cache: new InMemoryCache(),
});

const App = () => (
    <ApolloProvider client={client}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Launches />} />
        </Route>
      </Routes>
    </ApolloProvider>
);

export default App;
