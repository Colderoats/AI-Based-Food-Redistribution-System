import pool from "../config/db.js";

const distanceExpression = `(6371 * acos(least(1, greatest(-1,
  cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
  sin(radians($1)) * sin(radians(latitude))
))))`;

export const getMatches = async (req, res) => {
  const { foodType = "", maxDistance = 20 } = req.query;
  const isNgo = req.user.role === "ngo";
  const sourceTable = isNgo ? "NGO" : "FOOD_BUSINESS";
  const sourceId = isNgo ? "ngo_id" : "business_id";
  const targetTable = isNgo ? "FOOD_BUSINESS" : "NGO";
  const targetId = isNgo ? "business_id" : "ngo_id";
  const nameColumn = isNgo ? "business_name" : "ngo_name";

  try {
    const source = await pool.query(`SELECT latitude, longitude FROM ${sourceTable} WHERE ${sourceId} = $1`, [req.user.id]);
    const location = source.rows[0];
    const canCalculateDistance = location?.latitude !== null && location?.longitude !== null;

    if (!isNgo) {
      const query = canCalculateDistance
        ? `SELECT ${targetId} AS id, ${nameColumn} AS name, address, email, phone, service_radius_km,
             ROUND((${distanceExpression})::numeric, 1) AS distance_km
           FROM ${targetTable}
           WHERE latitude IS NOT NULL AND longitude IS NOT NULL
           AND (${distanceExpression}) <= $3
           ORDER BY distance_km ASC`
        : `SELECT ${targetId} AS id, ${nameColumn} AS name, address, email, phone, service_radius_km,
             NULL::numeric AS distance_km FROM ${targetTable} ORDER BY ${nameColumn}`;
      const targets = await pool.query(query, canCalculateDistance ? [location.latitude, location.longitude, Number(maxDistance)] : []);
      return res.json({ success: true, matchingReady: canCalculateDistance, matches: targets.rows.map((item) => ({ ...item, food_types: [] })) });
    }

    const query = canCalculateDistance
      ? `SELECT b.business_id AS id, b.business_name AS name, b.address, b.email, b.phone,
           ROUND((${distanceExpression})::numeric, 1) AS distance_km,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.category), NULL) AS food_types,
           COUNT(DISTINCT s.surplus_id) AS available_listings
         FROM FOOD_BUSINESS b
         JOIN surplus_food s ON s.inventory_id IN (SELECT inventory_id FROM inventory i JOIN product p ON p.product_id=i.product_id WHERE p.business_id=b.business_id) AND s.status = 'Available'
         LEFT JOIN inventory i ON i.inventory_id = s.inventory_id
         LEFT JOIN product p ON p.product_id = i.product_id
         WHERE ($3 = '' OR p.category ILIKE '%' || $3 || '%')
         GROUP BY b.business_id
         HAVING (${distanceExpression}) <= $4
         ORDER BY distance_km ASC`
      : `SELECT b.business_id AS id, b.business_name AS name, b.address, b.email, b.phone,
           NULL::numeric AS distance_km, ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.category), NULL) AS food_types,
           COUNT(DISTINCT s.surplus_id) AS available_listings
         FROM FOOD_BUSINESS b
         JOIN surplus_food s ON s.inventory_id IN (SELECT inventory_id FROM inventory i JOIN product p ON p.product_id=i.product_id WHERE p.business_id=b.business_id) AND s.status = 'Available'
         LEFT JOIN inventory i ON i.inventory_id = s.inventory_id
         LEFT JOIN product p ON p.product_id = i.product_id
         WHERE ($1 = '' OR p.category ILIKE '%' || $1 || '%')
         GROUP BY b.business_id
         ORDER BY b.business_name`;
    const params = canCalculateDistance ? [location.latitude, location.longitude, foodType, Number(maxDistance)] : [foodType];
    const result = await pool.query(query, params);
    res.json({ success: true, matchingReady: canCalculateDistance, matches: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to find nearby partners." });
  }
};
