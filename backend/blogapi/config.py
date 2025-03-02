"""
Configuraciones de la aplicación.
Se definen las configuraciones de la aplicación para manejar los diferentes entornos de ejecución.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class BaseConfig(BaseSettings):
    """
    Configuración base de la aplicación.
    Se definen las configuraciones base de la aplicación.
    """
    ENV_STATE: Optional[str] = None
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

class GlobalConfig(BaseConfig):
    """
    Configuración global de la aplicación.
    """
    DATABASE_URL: Optional[str] = None
    DB_FORCE_ROLL_BACK: bool = False

class DevConfig(GlobalConfig):
    """
    Configuración de desarrollo de la aplicación.
    """
    model_config = SettingsConfigDict(env_prefix="DEV_")

class ProdConfig(GlobalConfig):
    """
    Configuración de producción de la aplicación.
    """
    model_config = SettingsConfigDict(env_prefix="PROD_")

class TestConfig(GlobalConfig):
    """
    Configuración de pruebas de la aplicación.
    """
    DATABASE_URL: str = "sqlite:///test.db"
    DB_FORCE_ROLL_BACK: bool = True
    
    model_config = SettingsConfigDict(env_prefix="TEST_")

"""
Función para obtener la configuración de la aplicación.
:env_state: str
:return: Config
"""
@lru_cache()
def get_config(env_state: str):
    """Instantiate config based on the environment."""
    configs = {"dev": DevConfig, "prod": ProdConfig, "test": TestConfig}
    return configs[env_state]()

"""
Configuración de la aplicación.
Se obtiene la configuración de la aplicación.
Para cambiar entre  
"""
config = get_config(BaseConfig().ENV_STATE)