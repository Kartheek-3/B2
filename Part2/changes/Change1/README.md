# Change 1: Video Consultation Integration (Adapter Pattern)

## 1. Pattern Overview
- **Pattern Name**: Adapter Pattern (GoF Structural)
- **Problem**: The CarePulse healthcare appointment management system originally only supported in-person consultations. Teleconsultations require integration with external/third-party video conferencing providers whose proprietary APIs, session terminology, and token formats differ from the CarePulse core domain.
- **Solution**: Introduce a standardized `IVideoConsultationService` target interface, and implement concrete adapters (such as `LocalDemonstrationVideoAdapter`) that adapt proprietary provider clients (such as `LocalDemonstrationVideoProvider`) to the target interface.

## 2. Participant Roles
| Role in GoF Pattern | Concrete Implementation | File Location | Responsibility |
| :--- | :--- | :--- | :--- |
| **Target Interface** | `IVideoConsultationService` | `adapter/IVideoConsultationService.ts` | Defines the standard teleconsultation contract (`createRoom`, `getRoomDetails`, `generateParticipantAccess`). |
| **Client** | Appointment Scheduling & Teleconsultation UI | `Part2/code/lib/actions/appointment.actions.ts` | Consumes `IVideoConsultationService` polymorphically without coupling to any provider. |
| **Adaptee** | `LocalDemonstrationVideoProvider` | `adaptee/LocalDemonstrationVideoProvider.ts` | Proprietary video provider engine with incompatible parameter types, epoch timestamps, and session envelopes. Explicitly labeled local demonstration provider for zero-credential reproducible testing. |
| **Adapter** | `LocalDemonstrationVideoAdapter` | `adapter/LocalDemonstrationVideoAdapter.ts` | Bridges calls from `IVideoConsultationService` to `LocalDemonstrationVideoProvider`, converting types and translating roles (`doctor` -> `clinician`, `patient` -> `client`). |
| **Factory / Config** | `VideoServiceFactory` | `adapter/VideoServiceFactory.ts` | Resolves and supplies the configured video adapter. |

## 3. Key Design Decisions
- **Zero-Credential Reproducibility**: Paid video APIs (Twilio Video, Zoom, Daily.co) require API keys and webhooks not available in offline/grading environments. Providing a fully functioning `LocalDemonstrationVideoProvider` guarantees tests run offline while preserving realistic structural adaptation.
- **Role Translation**: Domain concepts `doctor` and `patient` are translated into adaptee concepts `clinician` and `client`.
- **Security**: Meeting access tokens are generated on-demand with 1-hour expiry, ensuring only authorized participants obtain join links.
