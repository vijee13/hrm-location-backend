let officeLocation = { lat: 0, long: 0, radius: 0 };

export const setOfficeLocation = (req, res) => {
  const { lat, long, radius } = req.body;
  officeLocation = { lat, long, radius };
  res.json({ message: "Office location updated", officeLocation });
};

export const getOfficeLocation = (req, res) => {
  res.json(officeLocation);
};

export default officeLocation;
