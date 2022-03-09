const ApolloServer = require("apollo-server").ApolloServer;
const ApolloServerLambda = require("apollo-server-lambda").ApolloServer;
const { gql } = require("apollo-server-lambda");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const { Band } = require("./band");
const { Genre } = require("./genre");
const { Instrument } = require("./instrument");
const { Role } = require("./role");
const { User } = require("./user");

const typeDefs = gql`
  type ListType {
    id: ID
    name: String
  }
  type Genre {
    id: ID
    name: String
  }
  type Role {
    id: ID
    name: String
  }
  type Instrument {
    id: ID
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
  # Bands
  type Band {
    id: ID
    name: String
    description: String
    location: String
    email: String
    foundation_date: String
    genres: [Genre]
    searching: [Role]
    videos: [Video]
    images: [Image]
    avatar: Image
    members: [User]
  }
  input GenreInput {
    name: String
  }
  input RoleInput {
    name: String
  }
  input InstrumentInput {
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
    genres: [GenreInput]
    instruments: [InstrumentInput]
    avatar: ImageInput
  }
  input BandCreateInput {
    name: String
    description: String
    location: String
    foundation_date: String
    email: String
    genres: [GenreInput]
    searching: [RoleInput]
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
    searching: [RoleInput]
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
    genres: [Genre]
    instruments: [Instrument]
    avatar: Image
  }
  input UserCreateInput {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    genres: [GenreInput]
    instruments: [InstrumentInput]
    avatar: ImageInput
  }
  input UserUpdateInput {
    name: String
    nickname: String
    description: String
    email: String
    birth_date: String
    address: String
    genres: [GenreInput]
    instruments: [InstrumentInput]
    avatar: ImageInput
  }
  type Query {
    getBands: [Band]
    getBand(id: ID!): Band
    getBandsFromSearch(text: String, type: String): [Band]
    getUsers: [User]
    getUser(id: ID!): User
    getUsersFromSearch(text: String, type: String): [User]
    getList(what: String): [ListType]
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
      const band = await Band.findById(id).populate("members");

      if (!band) {
        throw new Error("Band not found");
      }

      return band;
    },
    getBandsFromSearch: async (_, { text, type }) => {
      try {
        let filterBands = [];

        if (type === "content") {
          filterBands = await Band.find({
            $or: [
              { description: { $regex: text } },
              { name: { $regex: text } },
            ],
          });
        }

        if (type === "genre") {
          const genres = text.split(",");
          filterBands = await Band.find({
            genres: { $elemMatch: { name: { $in: genres } } },
          });
        }

        if (type === "searching") {
          const musicians = text.split(",");
          filterBands = await Band.find({
            searching: { $elemMatch: { name: { $in: musicians } } },
          });
        }

        return filterBands;
      } catch (err) {
        console.log(err);
      }
    },
    // getBandsFromSearch: async (_, { text, type }) => {
    //   try {
    //     const bands = await Band.find({});
    //     let filterBands = [];

    //     if (type === "content") {
    //       filterBands = bands.filter(
    //         (band) =>
    //           (band.name && band.name.includes(text)) ||
    //           (band.description && band.description.includes(text))
    //       );
    //     }

    //     if (type === "genre") {
    //       filterBands = bands.filter((band) => {
    //         if (band.genres) {
    //           let plainArray = band.genres.map((el) => el.name);
    //           return plainArray.includes(text);
    //         }

    //         return false;
    //       });
    //     }

    //     return filterBands;
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },
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
        let filterUsers = [];

        if (type === "content") {
          filterUsers = await User.find({
            $or: [
              { description: { $regex: text } },
              { name: { $regex: text } },
              { nickname: { $regex: text } },
            ],
          });
        }

        if (type === "genre") {
          const genres = text.split(",");
          filterUsers = await User.find({
            genres: { $elemMatch: { name: { $in: genres } } },
          });

          /*
          {
            genres: { $in: text.split(",") },
          }
          */
        }

        if (type === "instruments") {
          const instruments = text.split(",");
          filterUsers = await User.find({
            instruments: { $elemMatch: { name: { $in: instruments } } },
          });
        }

        return filterUsers;
      } catch (err) {
        console.log(err);
      }
    },
    getList: async (_, { what }) => {
      try {
        let list;

        if (what === "genres") {
          list = await Genre.find();
        }

        if (what === "instruments") {
          list = await Instrument.find();
        }

        if (what === "roles") {
          list = await Role.find();
        }

        console.log(list);

        return list;
      } catch (err) {
        console.log(err);
      }
    },
  },
  //   getUsersFromSearch: async (_, { text, type }) => {
  //     try {
  //       const users = await User.find({});
  //       let filterUsers = [];

  //       if (type === "content") {
  //         filterUsers = users.filter(
  //           (user) =>
  //             (user.name && user.name.includes(text)) ||
  //             (user.description && user.description.includes(text)) ||
  //             (user.nickname && user.nickname.includes(text))
  //         );
  //       }

  //       if (type === "genre") {
  //         filterUsers = users.filter((user) => {
  //           if (user.genres) {
  //             let plainArray = user.genres.map((el) => el.name);
  //             return plainArray.includes(text);
  //           }

  //           return false;
  //         });
  //       }

  //       return filterUsers;
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   },
  // },

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

let db;

function createLambdaServer() {
  return new ApolloServerLambda({
    typeDefs,
    resolvers,
    context: async () => {
      if (!db) {
        try {
          const dbClient = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
          });
        } catch (e) {
          console.log(
            "--->error while connecting with graphql context (db)",
            e
          );
        }
      }
    },
    introspection: true,
    playground: true,
  });
}

function createLocalServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      if (!db) {
        try {
          const dbClient = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
          });
        } catch (e) {
          console.log(
            "--->error while connecting with graphql context (db)",
            e
          );
        }
      }
    },
    introspection: true,
    playground: true,
  });
}

module.exports = { createLambdaServer, createLocalServer };
