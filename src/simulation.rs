use crate::vector::float2;

const GRAVITATIONAL_CONSTANT: f64 = 6.67430e-11;

pub struct Simulation {
    time_step: f64,
    sample: usize,
    states: Vec<State>,
}
#[derive(Clone)]
pub struct State {
    state_idx: usize,
    bodies: Vec<Body>,
}
impl State {
    pub fn get_bodies(&self) -> Vec<Body> {
        self.bodies.clone()
    }
}
#[derive(Clone)]
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
                state_idx: 0,
                bodies: starting_conditions,
            }],
        }
    }

    pub fn get_states(&self) -> Vec<State> {
        self.states.clone()
    }

    pub fn calculate_next_step(&mut self) {
        let mut new_state = self.states.last().unwrap().clone();
        for body in &mut new_state.bodies {
            body.acceleration = float2::empty();
            for other in &self.states.last().unwrap().bodies {
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
        new_state.state_idx += 1;
        self.states.push(new_state);
    }

    pub fn cleanup(&mut self) {
        let sample = self.sample;
        let len = self.states.last().unwrap().state_idx;

        self.states.retain(|state| {
            state.state_idx % sample == 0 || state.state_idx / sample >= len / sample
        });
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
