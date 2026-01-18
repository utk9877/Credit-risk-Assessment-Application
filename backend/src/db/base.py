from sqlalchemy.orm import declarative_base

Base = declarative_base()


def import_models():
    # Import models so that Alembic's autogenerate can find them via metadata
    from . import models  # noqa: F401
