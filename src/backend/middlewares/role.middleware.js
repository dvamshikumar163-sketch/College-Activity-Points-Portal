
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this resource.",
      });
    }

    // Faculty must be approved by the admin.
    if (
      req.user.role === "Faculty" &&
      allowedRoles.includes("Faculty") &&
      req.user.facultyAccess !== true
    ) {
      return res.status(403).json({
        success: false,
        message: "Your faculty access has not been approved by the admin.",
      });
    }

    next();
  };
};

export default allowRoles;

