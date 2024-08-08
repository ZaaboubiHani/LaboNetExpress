const User = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../middlewares/jwtMiddleware");
const twilio = require("twilio");
const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return `+213${phoneNumber.slice(1)}`;
  }
  return phoneNumber;
};
// Twilio configuration
const accountSid = "AC03a178cc5d3427a833ccc605a6b4d8b5";
const authToken = "4ab309b502fd7eb3930ec46e21119fef";
const serviceId = "VA8d0ac0d98a26fa8590c92dea7f48b9af";
const client = new twilio(accountSid, authToken);

const registerUser = async (req, res) => {
  try {
    let { password, ...userData } = req.body;

    let user = await User.findOne({
      email: userData.email,
    });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur avec l'email donné existe déjà",
      });
    }

    if (userData.email === password) {
      return res.status(400).json({
        success: false,
        message: "Votre email ne peut pas être votre mot de passe",
      });
    }

    if (!userData.fullname) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre nom et prénom",
      });
    }

    if (!userData.email) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre e-mail",
      });
    }

    if (!userData.phoneNumber1) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre numéro de téléphone",
      });
    }

    if (!userData.wilaya) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre wilaya",
      });
    }

    if (!userData.commune) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre commune",
      });
    }

    if (!userData.type) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre type",
      });
    }

    user = new User({
      ...userData,
      passwordHash: bcrypt.hashSync(password, 10),
      isValidated: false,
    });

    user = await user.save();

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur ne peut pas être créé",
      });
    }
    res.status(200).json({
      success: true,
      message: "Utilisateur créé avec succès",
    });
    // // Send verification code via Twilio Verify
    // client.verify.v2
    //   .services(serviceId)
    //   .verifications.create({
    //     to: formatPhoneNumber(userData.phoneNumber1),
    //     channel: "sms",
    //   })
    //   .then((verification) => {
    //     console.log(`Verification code sent: ${verification.sid}`);
    //     res.status(200).json({
    //       success: true,
    //       message:
    //         "Utilisateur enregistré avec succès. Un code de validation a été envoyé à votre numéro de téléphone.",
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(`Failed to send verification code: ${err}`);
    //     res.status(500).json({
    //       success: false,
    //       message:
    //         "Une erreur s'est produite lors de l'envoi du code de validation.",
    //     });
    //   });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

const sendCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    client.verify.v2
      .services(serviceId)
      .verifications.create({
        to: formatPhoneNumber(phoneNumber),
        channel: "sms",
      })
      .then((verification) => {
        console.log(`Verification code sent: ${verification.sid}`);
        res.status(200).json({
          success: true,
          message:
            "Utilisateur enregistré avec succès. Un code de validation a été envoyé à votre numéro de téléphone.",
        });
      })
      .catch((err) => {
        console.error(`Failed to send verification code: ${err}`);
        res.status(500).json({
          success: false,
          message:
            "Une erreur s'est produite lors de l'envoi du code de validation.",
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

const validateUser = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    const verificationCheck = await client.verify.v2
      .services(serviceId)
      .verificationChecks.create({
        to: formatPhoneNumber(phoneNumber),
        code: code,
      });

    if (verificationCheck.status === "approved") {
      const user = await User.findOne({ phoneNumber1: phoneNumber });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      user.isValidated = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Code de validation approuvé. Compte activé.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Code de validation incorrect",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${req.body.email}$`, "i") },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      try {
        if (!user.isValidated) {
          return res.status(400).json({
            success: false,
            message: "Votre compte n'est pas encore activé",
          });
        }
        const token = generateToken(user.id, user.isAdmin);
        res.status(200).json({
          message: "Connexion réussie",
          token: token,
        });
      } catch (tokenError) {
        res
          .status(500)
          .send("Une erreur s'est produite lors de la génération du jeton.");
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }
  } catch (error) {
    res
      .status(500)
      .send("Une erreur s'est produite lors de la recherche de l'utilisateur.");
    console.log(error);
  }
};
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Identifiant utilisateur manquant",
      });
    }
    if (req.body.isValidated) {
      return res.status(401).json({ success: false, message: "non autorisé" });
    }
    let userData = {
      image: req.body.image,
      email: req.body.email,
      name: req.body.name,
      phoneNumber1: req.body.phoneNumber1,
      phoneNumber2: req.body.phoneNumber2,
      wilaya: req.body.wilaya,
      commune: req.body.commune,
      coordinates: req.body.coordinates,
      deviceToken: req.body.deviceToken,
      isValidated: req.body.isValidated,
    };
    if (req.body.password) {
      userData.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, userData, { new: true })
      .select("-passwordHash") // Exclude passwordHash field
      .populate("image"); // Populate image field

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur N'existe Pas" });
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "Une erreur s'est produite lors de la mise à jour de l'utilisateur."
      );
    console.log(error);
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate("image");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur N'existe Pas" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Une erreur s'est produite .");
    console.log(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const searchText = req.query.text;

    let query = {
      isAdmin: false,
    };

    const options = {
      page,
      limit,
      select: "-passwordHash",
      sort: "-_id",
    };

    if (searchText) {
      query = {
        $and: [
          {
            $or: [
              { email: { $regex: new RegExp(searchText, "i") } },
              { name: { $regex: new RegExp(searchText, "i") } },
            ],
          },
          { isAdmin: false },
        ],
      };
    }

    const users = await User.paginate(query, options);

    if (!users) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur N'existe Pas" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send("Une erreur s'est produite .");
    console.log(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getMe,
  getUsers,
  validateUser,
  sendCode,
};
