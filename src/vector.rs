use std::ops::{Add, AddAssign, Mul, MulAssign, Sub, SubAssign};
use serde::{Serialize, Deserialize};

#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub struct float2 {
    x: f64,
    y: f64,
}

impl float2 {
    pub fn empty() -> Self {
        Self { x: 0_f64, y: 0_f64 }
    }
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn get_x(&self) -> f64 {
        self.x
    }
    pub fn get_y(&self) -> f64 {
        self.y
    }

    pub fn abs(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

// Implement primitive operations
impl Add for float2 {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}
impl AddAssign for float2 {
    fn add_assign(&mut self, other: Self) {
        self.x += other.x;
        self.y += other.y;
    }
}
impl Sub for float2 {
    type Output = Self;

    fn sub(self, other: Self) -> Self {
        Self {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
}
impl SubAssign for float2 {
    fn sub_assign(&mut self, other: Self) {
        self.x -= other.x;
        self.y -= other.y;
    }
}
// scalar multiplication
impl Mul<f64> for float2 {
    type Output = Self;

    fn mul(self, scalar: f64) -> Self {
        Self {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }
}
impl MulAssign<f64> for float2 {
    fn mul_assign(&mut self, scalar: f64) {
        self.x *= scalar;
        self.y *= scalar;
    }
}

// testing
#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn addition() {
        let mut a: float2 = float2 { x: 2_f64, y: 3_f64 };
        let b: float2 = float2 {
            x: 4_f64,
            y: -8_f64,
        };
        let out: float2 = float2 {
            x: 6_f64,
            y: -5_f64,
        };

        assert_eq!(a + b, out);

        a += b;
        assert_eq!(a, out);
    }
    // TODO test subtraction

    #[test]
    fn multiplication() {
        let mut a: float2 = float2 {
            x: 2_f64,
            y: -3_f64,
        };
        let b: f64 = 3_f64;
        let out: float2 = float2 {
            x: 6_f64,
            y: -9_f64,
        };

        assert_eq!(a * b, out);

        a *= b;

        assert_eq!(a, out);
    }

    #[test]
    fn absolute_value() {
        let a: float2 = float2 { x: 3_f64, y: 4_f64 };

        assert_eq!(a.abs(), 5_f64);
    }
}
