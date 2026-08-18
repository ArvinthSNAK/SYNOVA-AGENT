import json

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.model.insurer_snapshot import InsurerSnapshot
from app.model.wallet import Wallet
from app.model.notification import Notification
from app.insurer.mock_insurers import mock_insurers


def check_for_changes():
    db: Session = SessionLocal()

    changes = []

    try:
        for insurer_id, current_data in mock_insurers.items():

            current_json = json.dumps(
                current_data,
                sort_keys=True
            )

            snapshot = (
                db.query(InsurerSnapshot)
                .filter(
                    InsurerSnapshot.insurer_id == insurer_id
                )
                .first()
            )

            # First time seeing this insurer
            if snapshot is None:

                snapshot = InsurerSnapshot(
                    insurer_id=insurer_id,
                    data=current_json
                )

                db.add(snapshot)

                changes.append({
                    "insurer_id": insurer_id,
                    "change_type": "initial_snapshot",
                    "message": f"Initial data stored for {current_data['name']}."
                })

            # Existing insurer
            else:

                if snapshot.data != current_json:

                    # --------------------------------
                    # CHANGE DETECTED
                    # --------------------------------

                    changes.append({
                        "insurer_id": insurer_id,
                        "change_type": "insurer_update",
                        "message": f"{current_data['name']} has been updated."
                    })

                    # --------------------------------
                    # FIND CUSTOMERS IN WALLET
                    # --------------------------------

                    wallets = (
                        db.query(Wallet)
                        .filter(
                            Wallet.insurer_name == current_data["name"],
                            Wallet.status == "active"
                        )
                        .all()
                    )

                    # --------------------------------
                    # CREATE NOTIFICATION
                    # --------------------------------

                    for wallet in wallets:

                        notification = Notification(
                            user_id=wallet.user_id,
                            title=f"{current_data['name']} Update",
                            message=(
                                f"{current_data['name']} has updated "
                                f"its insurance information. "
                                f"Please review the latest policy details."
                            ),
                            notification_type="insurer_update",
                            is_read=False
                        )

                        db.add(notification)

                    # --------------------------------
                    # UPDATE SNAPSHOT
                    # --------------------------------

                    snapshot.data = current_json

        db.commit()

        return changes

    finally:
        db.close()