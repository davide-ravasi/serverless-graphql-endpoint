const ApolloServer = require("apollo-server").ApolloServer;
const ApolloServerLambda = require("apollo-server-lambda").ApolloServer;
const { gql } = require("apollo-server-lambda");

const typeDefs = gql`
  type Genre {
    name: String
  }

  type Video {
    title: String
    url: String
  }

  type Image {
    name: String
    url: String
  }

  type User {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    instruments: [String]
    avatar: Image
  }

  # Bands
  type Band {
    id: ID
    name: String
    description: String
    location: String
    email: String
    foundation_date: String
    genres: [Genre]
    videos: [Video]
    images: [Image]
    avatar: Image
    members: [User]
  }

  input GenreInput {
    name: String
  }

  input VideoInput {
    title: String
    url: String
  }

  input ImageInput {
    name: String
    url: String
  }

  input UserInput {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    instruments: [String]
    avatar: ImageInput
  }

  input BandCreateInput {
    name: String
    description: String
    location: String
    foundation_date: String
    email: String
    genres: [GenreInput]
    videos: [VideoInput]
    images: [ImageInput]
    avatar: ImageInput
  }

  input BandUpdateInput {
    name: String
    description: String
    location: String
    foundation_date: String
    email: String
    genres: [GenreInput]
    videos: [VideoInput]
    images: [ImageInput]
    avatar: ImageInput
    members: [UserInput]
  }
  type User {
    id: ID
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    instruments: [String]
    avatar: Image
  }

  input UserCreateInput {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    avatar: ImageInput
  }

  input UserUpdateInput {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    instruments: [String]
    avatar: ImageInput
  }

  type Query {
    getBands: [Band]
    getBand(id: ID!): Band
    getBandsFromSearch(text: String, type: String): [Band]
    getUsers: [User]
    getUser(id: ID!): User
    getUsersFromSearch(text: String, type: String): [User]
  }

  type Mutation {
    newBand(input: BandCreateInput): Band
    updateBand(id: ID!, input: BandUpdateInput): Band
    deleteBand(id: ID!): String
    newUser(input: UserCreateInput): User
    updateUser(id: ID!, input: UserUpdateInput): User
    deleteUser(id: ID!): String
  }
`;

const resolvers = {
  Query: {
    getBands: async () => {
      try {
        const bands = await Band.find({});

        return bands;
      } catch (err) {
        console.log(err);
      }
    },
    getBand: async (_, { id }) => {
      const band = await Band.findById(id);

      if (!band) {
        throw new Error("Band not found");
      }

      return band;
    },
    getBandsFromSearch: async (_, { text, type }) => {
      try {
        const bands = await Band.find({});
        let filterBands = [];
        if (type === "content") {
          filterBands = bands.filter(
            (band) =>
              band.name?.includes(text) || band.description?.includes(text)
          );
        }

        if (type === "genre") {
          filterBands = bands.filter((band) => band.genres?.includes(text));
        }

        return filterBands;
      } catch (err) {
        console.log(err);
      }
    },
    getUsers: async () => {
      try {
        const users = await User.find({});

        return users;
      } catch (err) {
        console.log(err);
      }
    },
    getUser: async (_, { id }) => {
      const user = await User.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
    getUsersFromSearch: async (_, { text, type }) => {
      try {
        const users = await User.find({});

        const filterUsers = users.filter(
          (user) =>
            user.name?.includes(text) ||
            user.description?.includes(text) ||
            user.nickname?.includes(text)
        );

        return filterUsers;
      } catch (err) {
        console.log(err);
      }
    },
  },

  Mutation: {
    newBand: async (_, { input }) => {
      try {
        const band = new Band(input);

        const result = await band.save();

        return result;
      } catch (err) {
        console.log(err);
      }
    },
    updateBand: async (_, { id, input }) => {
      let band = await Band.findById(id);

      if (!band) {
        throw new Error("Band not found");
      }

      band = await Band.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return band;
    },
    deleteBand: async (_, { id }) => {
      const band = await Band.findById(id);

      if (!band) {
        throw new Error("Band not found");
      }

      await Band.findOneAndDelete({ _id: id });

      return "Band removed";
    },
    newUser: async (_, { input }) => {
      try {
        const user = new User(input);

        const result = await user.save();

        return result;
      } catch (err) {
        console.log(err);
      }
    },
    updateUser: async (_, { id, input }) => {
      let user = await User.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      user = await User.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return user;
    },
    deleteUser: async (_, { id }) => {
      const user = await User.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      await User.findOneAndDelete({ _id: id });

      return "User removed";
    },
  },
};

function createLambdaServer() {
  return new ApolloServerLambda({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

function createLocalServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

module.exports = { createLambdaServer, createLocalServer };
