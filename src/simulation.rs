use crate::vector::float2;

const GRAVITATIONAL_CONSTANT: f64 = 6.67430e-11;

pub struct Simulation {
    time_step: f64,
    sample: usize,
    states: Vec<State>,
    idx: usize,
}
#[derive(Clone)]
pub struct State {
    bodies: Vec<Body>,
}
impl State {
    pub fn get_bodies(&self) -> Vec<Body> {
        self.bodies.clone()
    }
}
// need to derive for API requests
use serde::{Serialize, Deserialize};
#[derive(Clone, Serialize, Deserialize)]
pub struct Body {
    pub position: float2,
    pub mass: f64,
    pub velocity: float2,
    pub acceleration: float2,
}
impl Body {
    pub fn get_x(&self) -> f64 {
        self.position.get_x()
    }
    pub fn get_y(&self) -> f64 {
        self.position.get_y()
    }
}

impl Simulation {
    pub fn new(starting_conditions: Vec<Body>, time_step: f64, sample: usize) -> Self {
        Self {
            time_step,
            sample,
            states: vec![State {
                bodies: starting_conditions,
            }],
            idx: 0,
        }
    }

    pub fn get_states(&self) -> Vec<State> {
        self.states.clone()
    }

    pub fn calculate_next_step(&mut self) {
        let current_state = self.states.last().unwrap();
        let mut new_state = current_state.clone();
        for body in &mut new_state.bodies {
            body.acceleration = float2::empty();
            for other in &current_state.bodies {
                // skip same body
                if body.position == other.position {
                    continue;
                }
                let distance: float2 = other.position - body.position;
                let imposed_acceleration: float2 =
                    distance * GRAVITATIONAL_CONSTANT * (other.mass / distance.abs().powi(3));
                body.acceleration += imposed_acceleration
            }
        }

        for body in &mut new_state.bodies {
            body.velocity += body.acceleration * self.time_step;
            body.position += body.velocity * self.time_step;
        }
        if self.idx % self.sample == 0 {
            self.states.push(new_state);
        } else {
            *self.states.last_mut().unwrap() = new_state;
        }
        self.idx += 1;
    }

    pub fn log_last_state(&self) {
        for (i, body) in self.states.last().unwrap().bodies.iter().enumerate() {
            println!(
                "Body {}:\n  Position ({:?})\n  Velocity ({:?})\n  Acceleration ({:?})",
                i + 1,
                body.position,
                body.velocity,
                body.acceleration
            );
        }
    }
}
