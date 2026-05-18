from dataclasses import dataclass

import torch
import torch.nn as nn
import torch.nn.functional as F

@dataclass
class ModelConfig:
  hidden_state: int = 128
  n_layers: int = 1
  num_classes: int = 2


class EEGModelForClassification(nn.Module):
  def __init__(self, config: ModelConfig):
    self.config = config

    self.lm_head = nn.Linear(self.config.hidden_state, self.config.num_classes)


  def call(self, x):
    return self.lm_head(x)
