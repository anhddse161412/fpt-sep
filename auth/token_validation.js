const { verify } = require("jsonwebtoken");

module.exports = {
   checkToken: (req, res, next) => {
      let token = req.get("authorization");
      if (token) {
         console.log(token);
         // Remove "Bearer "  from string
         token = token.slice(7);
         verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
               return res.json({
                  success: 0,
                  message: "Invalid Token...",
               });
            } else {
               req.decoded = decoded;
               next();
            }
         });
      } else {
         return res.json({ message: "access denied" });
      }
      return;
   },
};
